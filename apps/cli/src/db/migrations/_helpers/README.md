# Warning

**Remember that migrations are immutable** -- once published they cannot be changed

That must extend transitively to any imports they depend on

- You may reuse existing (old) helper functions
- You must NOT change/update/edit/refactor existing (old) helper functions
- If you need different behaviour, you must define a new function