#!/usr/bin/env python3
"""Copy the latest Tripo download into each staging root.

The CLI writes `tripo-out/<name>-<id8>/`. This flattens preview, task.json,
and the raw GLB next to source.png / settings.json / qa-state.json.
Does not promote into public/assets/models/.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STAGING_ROOT = ROOT / "assets" / "tripo" / "staging"


def latest_run(staging: Path) -> Path | None:
    runs = [path for path in (staging / "tripo-out").glob("*") if path.is_dir()]
    if not runs:
        return None
    return max(runs, key=lambda path: path.stat().st_mtime)


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def collect(staging: Path) -> bool:
    run = latest_run(staging)
    if run is None:
        return False
    task_src = run / "task.json"
    preview_src = run / "preview.png"
    glbs = sorted(run.glob("*.glb"))
    if task_src.is_file():
        staging.joinpath("task.json").write_bytes(task_src.read_bytes())
    if preview_src.is_file():
        staging.joinpath("preview.png").write_bytes(preview_src.read_bytes())
    raw_glb = None
    if glbs:
        raw_glb = staging / "raw.glb"
        raw_glb.write_bytes(glbs[0].read_bytes())
    record = load_json(staging / "task.json")
    qa = load_json(staging / "qa-state.json")
    qa.update(
        {
            "qa_state": "awaiting_visual_approval" if (preview_src.is_file() and raw_glb) else "partial_download",
            "visual_approval_status": qa.get("visual_approval_status") or "pending",
            "visual_approval_required": True,
            "task_id": record.get("task_id"),
            "credits_consumed": record.get("credits_consumed"),
            "cost": record.get("credits_consumed"),
            "preview": "preview.png" if preview_src.is_file() else None,
            "raw_glb": "raw.glb" if raw_glb else None,
            "promoted_to_runtime": False,
        }
    )
    write_json(staging / "qa-state.json", qa)
    print(f"{staging.name}: task_id={qa.get('task_id')} credits={qa.get('credits_consumed')}")
    return True


def main() -> None:
    collected = 0
    for staging in sorted(path for path in STAGING_ROOT.iterdir() if path.is_dir()):
        collected += int(collect(staging))
    print(f"collected {collected} staging result(s); none promoted")


if __name__ == "__main__":
    main()
