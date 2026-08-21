# SPELLCHECK Tripo staging

First-pass image-to-3D only. No paid jobs have been submitted.

## Layout

| Path | Role |
|---|---|
| `batch/spellcheck-tripo-pilot.yaml` | Three-asset pilot: golem, goose, Scriptorium |
| `batch/spellcheck-tripo-queue.yaml` | All `tripo_direct_candidate` and `tripo_shell_then_rebuild` assets |
| `staging/<asset-id>/` | Source image, settings, QA state, and later artifacts |
| `../../public/assets/models/` | R3F runtime GLBs — promotion blocked until visual approval |

## After login

1. `tripo doctor`
2. `tripo balance`
3. Explicit operator approval to spend credits.
4. Pilot only: `tripo batch run assets/tripo/batch/spellcheck-tripo-pilot.yaml`
5. `python3 scripts/tripo/collect-artifacts.py`
6. Visual approval before any `--then` processing or runtime copy.

Re-running the same `batch run` resumes: succeeded jobs are skipped. `--fresh` re-spends credits.

Do not use `--for game-mobile`, `--for game-pc`, `--for ar-web`, or `--for anim` on first pass. Those presets convert to FBX, decimate, or rig before anyone has seen the mesh.
