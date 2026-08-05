<template>
  <div class="min-h-screen bg-black text-util-gray-02 py-20 px-4 font-sans border-b border-b-frequency">
    <div class="text-center mb-12">
      <h1 class="text-[40px] mb-2 text-insight text-bold">
        Pricing
      </h1>
      <p class="text-[18px] font-medium">
        Start for free. Upgrade for more.
      </p>
    </div>

    <div class="matrix-scroll">
      <div class="matrix">
        <!-- header row -->
        <div class="mcell hcell lblh" />
        <div class="mcell hcell col-free">
          <p class="kicker">
            Free project
          </p>
          <div class="htt">
            Free
          </div>
          <div class="hsub">
            For everyone. No trial, no card.
          </div>
        </div>
        <div class="mcell hcell col-prem">
          <p class="kicker">
            Premium project
          </p>
          <div class="htt">
            Premium
          </div>
          <div class="hsub">
            Everything in Free, plus more.
          </div>
        </div>

        <!-- feature rows -->
        <template
          v-for="row in rows"
          :key="row.label"
        >
          <div class="mcell lbl">
            <span class="k">{{ row.label }}</span>
          </div>
          <div class="mcell col-free">
            <div class="val">
              <div class="row">
                <CheckIcon class="ic" />
                <span>
                  <span class="vline">{{ row.free.value }}</span>
                  <span class="sline">{{ row.free.detail }}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="mcell col-prem">
            <div class="val">
              <div class="row">
                <CheckIcon class="ic" />
                <span>
                  <span class="vline">{{ row.premium.value }}</span>
                  <span class="sline">{{ row.premium.detail }}</span>
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- footer row -->
        <div class="mcell lbl ctacell">
          &nbsp;
        </div>
        <div class="mcell col-free ctacell">
          <button
            class="cta free-cta"
            @click="signup"
          >
            Start for free
          </button>
          <p class="subcta">
            Always free
          </p>
        </div>
        <div class="mcell col-prem ctacell">
          <div class="upgrade-note">
            Upgrade a Project Anytime
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { type AxiosInstance } from 'axios'
import { defineComponent, h, inject } from 'vue'

import { apiArbimonLegacyClearSession } from '@rfcx-bio/common/api-arbimon/legacy-logout'

import { apiClientArbimonLegacyKey, authClientKey } from '@/globals'
import { track } from '~/analytics'
import { ROUTE_NAMES } from '~/router'

const auth = inject(authClientKey) as Auth0Client
const apiClientArbimonLegacy = inject(apiClientArbimonLegacyKey) as AxiosInstance

const CheckIcon = defineComponent({
  render () {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
        clipRule: 'evenodd'
      })
    ])
  }
})

interface TierCell { value: string, detail: string }
interface FeatureRow { label: string, free: TierCell, premium: TierCell }

const rows: FeatureRow[] = [
  {
    label: 'Recordings',
    free: { value: '12,000,000 minutes', detail: 'of audio storage per project' },
    premium: { value: 'Unlimited minutes', detail: 'no storage ceiling' }
  },
  {
    label: 'Team',
    free: { value: 'Up to 5 collaborators', detail: 'plus unlimited guests' },
    premium: { value: 'Unlimited collaborators', detail: 'including co-admins' }
  },
  {
    label: 'Privacy',
    free: { value: 'Private / Hidden', detail: 'for up to 12 months' },
    premium: { value: 'Private / Hidden', detail: 'with no time limit' }
  },
  {
    label: 'Analyses',
    free: { value: 'Up to 10 jobs / day', detail: '45,000 recordings per analysis' },
    premium: { value: 'Unlimited', detail: 'no daily cap or size limit' }
  },
  {
    label: 'Processing',
    free: { value: 'Community pool', detail: 'shared analysis capacity' },
    premium: { value: 'Jump the queue', detail: 'priority + 2× faster processing' }
  },
  {
    label: 'Toolkit',
    free: { value: 'Full suite', detail: 'PM, RF & CNN, soundscapes, AED, clustering, visualizer, insights, export' },
    premium: { value: 'The full Free toolkit', detail: 'nothing removed' }
  },
  {
    label: 'Export',
    free: { value: 'Unlimited', detail: 'detections, sites & analysis results' },
    premium: { value: 'Unlimited', detail: 'all project data' }
  },
  {
    label: 'Re-Download',
    free: { value: '60 recordings / day', detail: 're-download your original audio' },
    premium: { value: '60,000 recordings / day', detail: 're-download your original audio' }
  },
  {
    label: 'Retention',
    free: { value: '10-year guarantee', detail: 'your data is preserved — on every tier' },
    premium: { value: '10-year guarantee', detail: 'your data is preserved — on every tier' }
  }
]

const signup = async (): Promise<void> => {
  track('pricing_signup_clicked', { source: 'pricing_page' })
  await apiArbimonLegacyClearSession(apiClientArbimonLegacy).catch(() => {})
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, screen_hint: 'signup' })
}
</script>

<style scoped>
/* Variant B "unified grid" (design/pricing-mockup/compare-variants.html, 2026-08-03).
   Palette mirrors windi.config.ts: frequency #ADFF2C, chirp #D2FF8A, echo #14130D,
   pitch #060508, insight #FFFEFC, cloud #F9F6F2, grays D3D2CF/A1A19E/4B4B4B/242424. */
.matrix-scroll{max-width:980px;margin:0 auto;overflow-x:auto}
/* label column shrinks to its text (free column sits flush against it); free column
   absorbs the freed width; premium column keeps a fixed width */
.matrix{display:grid;grid-template-columns:max-content 1fr 306px;min-width:760px;
  border:1px solid #242424;border-radius:24px;overflow:hidden;background:#14130D}
.mcell{padding:14px 18px;border-top:1px solid #242424;display:flex;flex-direction:column;justify-content:center}
.col-free.mcell{background:linear-gradient(180deg,#20240f,#1a1d0e);
  box-shadow:inset 1px 0 0 rgba(210,255,138,.22),inset -1px 0 0 rgba(210,255,138,.22)}
.col-prem.mcell{background:linear-gradient(180deg,#1d2110,#181b0d)}
.matrix > .mcell:nth-child(1),.matrix > .mcell:nth-child(2),.matrix > .mcell:nth-child(3){border-top:none}
.mcell.lbl .k{font-size:13px;color:#D3D2CF;font-weight:600}
.mcell .val{font-size:13.5px;line-height:1.38;color:#FFFEFC}
.col-free.mcell .val{color:#F9F6F2}
/* two-line cells: bold highlighted value line + lighter secondary info line */
.mcell .val .vline{display:block;font-size:14px;font-weight:700;line-height:1.3;color:#ADFF2C}
.mcell .val .sline{display:block;font-size:12px;color:#A1A19E;line-height:1.35;margin-top:2px;font-weight:400}
.mcell .row{display:grid;grid-template-columns:15px 1fr;gap:9px;align-items:start}
.mcell .ic{width:14px;height:14px;margin-top:2px}
.col-free.mcell .ic{color:#D2FF8A}
.col-prem.mcell .ic{color:#ADFF2C}
.hcell{padding:20px 18px}
.hcell.lblh{background:#14130D}
.col-free.hcell{background:linear-gradient(180deg,#262c10,#20240f);border-bottom:3px solid #ADFF2C;
  box-shadow:inset 1px 0 0 rgba(210,255,138,.22),inset -1px 0 0 rgba(210,255,138,.22)}
.col-prem.hcell{background:linear-gradient(180deg,#212611,#1d2110);border-bottom:2px solid rgba(173,255,44,.5)}
.hcell .kicker{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin:0 0 5px}
.col-free.hcell .kicker{color:#D2FF8A}
.col-prem.hcell .kicker{color:#ADFF2C}
.hcell .htt{font-size:23px;font-weight:800;color:#FFFEFC;margin:0 0 3px}
.hcell .hsub{font-size:12px;color:#A1A19E;line-height:1.4}
.ctacell{padding:16px 18px}
.ctacell .cta{height:40px;width:100%;border:none;border-radius:9999px;font-size:14px;font-weight:600;cursor:pointer}
.ctacell .free-cta{background:#D2FF8A;color:#060508}
.ctacell .subcta{font-size:11px;color:#A1A19E;text-align:center;margin-top:8px}
/* Premium footer: plain light text, not a button — nothing clickable/performable here */
.ctacell .upgrade-note{display:flex;align-items:center;justify-content:center;height:40px;
  color:rgba(173,255,44,.66);font-size:13px;font-weight:400;letter-spacing:.02em;user-select:none}
</style>
