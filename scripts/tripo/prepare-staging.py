#!/usr/bin/env python3
"""Build Tripo staging dirs and resumable batch YAML from the v1.1 manifest.

Does not submit generation tasks.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / "assets" / "SPELLCHECK_2D_Asset_Package_v1.1"
MANIFEST_PATH = PACKAGE / "ASSET_MANIFEST.json"
STAGING_ROOT = ROOT / "assets" / "tripo" / "staging"
BATCH_DIR = ROOT / "assets" / "tripo" / "batch"
RUNTIME_DIR = "public/assets/models"
WANTED = {"tripo_direct_candidate", "tripo_shell_then_rebuild"}
PILOT_IDS = ("cooldown-golem", "misfire-goose", "traveling-scriptorium")
QUEUE_ORDER = (
    *PILOT_IDS,
    "typomancer",
    "bard-familiar",
    "inkblot-imp",
    "ruined-archive-gateway",
    "ice-crystal-ridge",
    "earth-raised-barrier",
    "field-casting-lectern",
    "margin-archivist-npc",
    "wordlock-shrine",
    "scriptorium-waymark-dock",
    "rune-grimoire-keyboard",
    "rune-monolith",
    "world-space-prompt-anchor",
    "route-bridge",
    "redaction-hound",
    "homophone-harpy",
    "syntax-wyrm",
)
BLOCKED = (
    "rig",
    "retopology",
    "decimate",
    "animation",
    "runtime_promotion",
)


def texture_quality(texture_target: object) -> str:
    text = str(texture_target or "")
    return "detailed" if "2K" in text else "standard"


def gen_params(asset: dict) -> dict:
    return {
        "texture": True,
        "pbr": True,
        "texture_quality": texture_quality(asset.get("texture_target")),
        "texture_alignment": "original_image",
        "auto_size": True,
    }


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def prepare_asset(asset: dict, wave: str) -> Path:
    dest = STAGING_ROOT / asset["id"]
    dest.mkdir(parents=True, exist_ok=True)
    source = PACKAGE / asset["file"]
    if not source.is_file():
        raise FileNotFoundError(source)
    copied = dest / f"source{source.suffix.lower()}"
    shutil.copy2(source, copied)
    params = gen_params(asset)
    settings = {
        "asset_id": asset["id"],
        "package_id": "spellcheck-2d-asset-package-v1-1",
        "package_file": asset["file"],
        "strategy": asset["strategy"],
        "wave": wave,
        "role": asset.get("role"),
        "priority": asset.get("priority"),
        "scale_m": asset.get("scale_m"),
        "triangle_target": asset.get("triangle_target"),
        "texture_target": asset.get("texture_target"),
        "rig_after_approval": asset.get("rig"),
        "notes": asset.get("notes"),
        "runtime_format": "GLB",
        "runtime_destination": f"{RUNTIME_DIR}/{asset['id']}.glb",
        "model": "tripo-v3.1",
        "params": params,
        "then": None,
        "for": None,
        "blocked_until_visual_approval": list(BLOCKED),
        "command_after_login": (
            f"tripo make {copied.relative_to(ROOT)} "
            f"--model tripo-v3.1 "
            f"--name {asset['id']} "
            f"-o assets/tripo/staging/{asset['id']} "
            f"-p texture=true -p pbr=true "
            f"-p texture_quality={params['texture_quality']} "
            f"-p texture_alignment=original_image -p auto_size=true "
            "--json --yes"
        ),
    }
    qa = {
        "qa_state": "awaiting_generation",
        "visual_approval_status": "not_started",
        "visual_approval_required": True,
        "task_id": None,
        "credits_consumed": None,
        "cost": None,
        "preview": None,
        "raw_glb": None,
        "promoted_to_runtime": False,
        "blocked_operations": list(BLOCKED),
        "intake": {
            "front": "pending",
            "rear": "pending",
            "sides": "pending",
            "top": "pending",
            "underside": "pending",
            "geometry": "pending",
            "materials": "pending",
            "scale_pivot": "pending",
            "gameplay_camera": "pending",
        },
    }
    task = {
        "task_id": None,
        "status": "not_submitted",
        "credits_consumed": None,
        "note": "Paid generation has not been submitted.",
    }
    write_json(dest / "settings.json", settings)
    write_json(dest / "qa-state.json", qa)
    write_json(dest / "task.json", task)
    return dest


def yaml_params(params: dict, indent: int) -> str:
    pad = " " * indent
    child = " " * (indent + 2)
    lines = [f"{pad}params:"]
    for key, value in params.items():
        rendered = "true" if value is True else "false" if value is False else value
        lines.append(f"{child}{key}: {rendered}")
    return "\n".join(lines)


def write_manifest(path: Path, assets: list[dict], title: str) -> None:
    default_params = {
        "texture": True,
        "pbr": True,
        "texture_quality": "standard",
        "texture_alignment": "original_image",
        "auto_size": True,
    }
    chunks = [
        f"# {title}",
        "# DO NOT RUN until tripo login, tripo doctor, and explicit paid-generation approval.",
        "# Resume: re-run this file. Succeeded jobs are skipped. --fresh re-spends credits.",
        "# No `for` / `then`: first pass is raw v3.1 image-to-3D GLB. Visual approval before rig/retopo/anim.",
        "",
        "concurrency: 1",
        "defaults:",
        "  model: tripo-v3.1",
        yaml_params(default_params, 2),
        "jobs:",
    ]
    for asset in assets:
        params = gen_params(asset)
        staging = f"assets/tripo/staging/{asset['id']}"
        chunks.append(f"  - name: {asset['id']}")
        chunks.append(f"    input: {staging}/source.png")
        chunks.append(f"    out: {staging}")
        if params != default_params:
            chunks.append(yaml_params(params, 4))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(chunks) + "\n", encoding="utf-8")


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    by_id = {
        asset["id"]: asset
        for asset in manifest["assets"]
        if asset.get("strategy") in WANTED
    }
    missing = [asset_id for asset_id in QUEUE_ORDER if asset_id not in by_id]
    extra = sorted(set(by_id) - set(QUEUE_ORDER))
    if missing or extra:
        raise SystemExit(f"queue drift: missing={missing} extra={extra}")
    ordered = [by_id[asset_id] for asset_id in QUEUE_ORDER]
    STAGING_ROOT.mkdir(parents=True, exist_ok=True)
    for asset in ordered:
        wave = "pilot" if asset["id"] in PILOT_IDS else "queued"
        prepare_asset(asset, wave)
    write_manifest(
        BATCH_DIR / "spellcheck-tripo-queue.yaml",
        ordered,
        "SPELLCHECK Tripo queue — tripo_direct_candidate + tripo_shell_then_rebuild",
    )
    write_manifest(
        BATCH_DIR / "spellcheck-tripo-pilot.yaml",
        [by_id[asset_id] for asset_id in PILOT_IDS],
        "SPELLCHECK Tripo three-asset pilot",
    )
    registry = {
        "package": str(PACKAGE.relative_to(ROOT)),
        "submitted": False,
        "runtime_format": "GLB",
        "runtime_destination": RUNTIME_DIR,
        "visual_approval_required": True,
        "pilot": list(PILOT_IDS),
        "jobs": [
            {
                "id": asset["id"],
                "strategy": asset["strategy"],
                "wave": "pilot" if asset["id"] in PILOT_IDS else "queued",
                "staging": f"assets/tripo/staging/{asset['id']}",
            }
            for asset in ordered
        ],
    }
    write_json(ROOT / "assets" / "tripo" / "registry.json", registry)
    print(f"prepared {len(ordered)} staging dirs; submitted=false")


if __name__ == "__main__":
    main()
