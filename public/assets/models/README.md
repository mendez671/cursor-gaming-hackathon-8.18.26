# Runtime GLB library

This directory is the R3F destination for accepted SPELLCHECK models.

Promotion rule: copy a staged GLB here only after `qa-state.json` records `visual_approval_status: approved`. Until then, keep candidates in `assets/tripo/staging/<asset-id>/`.

Operator-authorized live preview (2026-08-20): the three first-pass pilots (`cooldown-golem`, `misfire-goose`, `traveling-scriptorium`) may be copied here for in-scene costume swap without marking `visual_approval_status: approved`. Staging files stay in place. Do not commit the ~40 MB raw files. Full intake (retopo, rig, commercial gate) still waits on approval.
