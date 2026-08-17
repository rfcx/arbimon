# DESIGN — import-recordings staged-analysis rebuild (2026-08-12)

> Operator spec 2026-08-12 08:30–08:44 EDT. Stacks on the #112 FLAC-encoder
> branch. Demo-first (ADR-026); test ALL AT ONCE on demo.arbimon.org before
> the prod verdict. This file is the working design; it moves to
> rfcx-local/runbooks/ on landing.

## 1. Route
- `/p/:projectSlug/import-recordings` → NEW page (REPLACES the legacy
  import-recordings component at that route).
- `/import-recordings-new` (top-level, unlisted beta) → route REMOVED;
  redirect to project selection prompt or the marketing 404? DECISION:
  redirect to `/` (the page was unlisted; no inbound links exist).
- Legacy component file stays in-tree for now (dead code removal at prod
  promotion, keeps the demo diff reviewable).
- Project comes from the route (storeProjectGuard already resolves it);
  view-only lock check preserved (apiBioGetProjectBySlug isLocked).

## 2. Timezone control
Label: **"Timezone of Audio Recordings"**. Options in order:
1. `auto` — **Automatic** (default)
2. `site` — **Site Local Time (<site.timezone>)** — uses the SITE's stored
   IANA tz from apiArbimonGetSites (99.75% populated). If the selected site
   has empty timezone → option disabled with "(unknown)".
3. `utc` — **UTC**

### Automatic precedence ladder (per file, decided at analyze time)
1. Explicit offset in the parsed filename (`…+0700`, `Z`) → `filename-offset`
2. File metadata: WAV `guan` (GUANO `Timestamp:` with offset) or AudioMoth
   `LIST/INFO ICMT` ("Recorded at HH:MM:SS DD/MM/YYYY (UTC±H) by AudioMoth")
   → `file-metadata`. (FLAC/opus: no metadata rung — falls through.)
3. Filename local-naive time interpreted in the SITE's IANA tz (when the
   site has one) → `site-local`
4. UTC → `utc-fallback`

Manual modes force: `site` → all files `site-local` (forced), `utc` → all
files `utc` (forced). "Timezone Determined By" column shows the rung.
GUANO/ICMT timestamp, when present WITH offset, also *overrides the
filename-parsed wall time* (it is the recorder's own clock statement) —
but only in Automatic mode.

## 3. Staged-analysis model (engine)
New states BEFORE `queued`:
- `analyzing` — filename parse + header probe + GUANO/ICMT + tz decision
  (cheap: bounded header reads, NO sha1)
- `staged` — analysis complete, awaiting explicit start. Files with a
  hard analysis failure (no timestamp derivable) stage as `staged` with
  `analysisError` set (visible in Status, excluded from start).
New terminal state: `cancelled` — user cancel (pre- or mid-upload; aborts
in-flight PUT). Behaves like `failed` (retryable via Retry → back through
queued; the multipart/signed context is discarded like retry does).

Start/Pause semantics:
- **Start** releases `staged` items (all, or selection) → `queued` → the
  existing pipeline (prepare = sha1 + FLAC transcode; unchanged).
- **Pause** = engine.pause() (existing; aborts PUTs → signed).
- Button shows Paused state automatically when nothing is active
  (activeCount==0) — incl. "all visible complete".

## 4. Item fields added
- `directory` (relativePath minus filename)
- `timezoneSource`: 'filename-offset'|'file-metadata'|'site-local'|
  'utc-fallback'|'forced-site'|'forced-utc'
- `timezoneName` (IANA or '+HH:MM' shown in the Timezone/Offset column)
- `localWallTime` (the pre-conversion wall time for Date/Time columns —
  display in the determined tz, not browser tz)
- `fileFormat` ('wav'|'flac'|'opus'|'unknown'), sampleRateHz (exists),
  durationMs (exists)
- `analysisError?: string`
- transfer metrics: `uploadStartedAtMs`, `uploadedAtMs`,
  `uploadedBytes` (final), → avg rate = bytes/(end-start). Multipart
  progress callback already gives loadedBytes for live rate.
- `siteName` (denormalized for the table; streamId already exists)

## 5. Table (dedicated component, recordings-list idiom)
Columns: [☑] Filename · Site · Directory · Recording Date · Recording
Time · Timezone/Offset · Timezone Determined By · Format (type, rate) ·
Length (MM:SS) · Status · Transfer Progress · Transfer Rate (Avg) ·
Destination (↗ post-ingest; the existing resolveRecordingId flow) ·
row actions (Cancel | Clear | Retry — state-gated icons).
- Client-side sort (everything is local) — asc/desc toggle per header.
- Header ☑ = select/deselect all VISIBLE (post-filter) rows.
- Bulk bar appears when selection>0: Start Selected, Cancel Selected,
  Clear Selected, Retry Selected.
- Standing buttons: Clear Completed · Clear Failed · Retry Failed.
- "Hide:" checkboxes: Completed, Failed, Cancelled, Duplicate, Upload
  In-Progress, Upload Pending, Transcode In-Progress, Transcode Pending,
  Processing, Staged. (Status → group mapping in §6.)
- Status column = STATE_LABELS + the server/API message verbatim
  (item.error / analysisError).

## 6. Status → filter-group mapping
- Staged: analyzing, staged
- Upload Pending: queued*, ready, signing, signed (*pre-transcode queued
  shows as Transcode Pending when FLAC enabled & file is encodable-WAV)
- Transcode Pending / In-Progress: sub-states of preparing (the transcode
  step reports phase via a new progress event; preparing splits into
  hash/encode phases for display only)
- Upload In-Progress: uploading
- Processing: uploaded (server ingest)
- Completed: ingested; Duplicate: duplicate; Failed: failed, rejected;
  Cancelled: cancelled.

## 7. Page chrome
- FLAC toggle checkbox ("Convert WAV to FLAC before upload (lossless,
  ~2× faster)") — default ON, wired to flacEncodeEnabled.
- Pop-out button → window.open(same URL + `?popout=1`,
  'arbimon-uploader', 'popup=yes,width=1200,height=800'). In popout mode
  hide nav chrome (the layout section paddings). NOTE: the engine
  singleton is per-window — the popped-out window runs its own engine on
  the SAME IndexedDB queue. To avoid double-driving, the opener page
  detects `popout` child via BroadcastChannel and goes dormant
  (view-only banner). [RE-REVIEW: simplest safe = opener PAUSES its
  engine + shows "Uploads continue in the popped-out window".]
- Global metrics bar: current transfer rate (EMA over active PUT
  progress events), session-total bytes transferred for THIS project
  (localStorage key `upload-metrics:<projectId>`, reset on auth
  user-id change), counts: completed / failed / duplicates.

## 8. Out of scope (unchanged)
Engine transport (sign/PUT/multipart/poll), FLAC encoder, dedup contract,
tray TaskSource (keeps working — states map), desktop shell.
