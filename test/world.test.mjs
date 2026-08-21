import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BAKED_PLACEMENTS,
  CAST_FX,
  MODULE_DECK,
  PILOT_COSTUMES,
  REACTION_ZONE_IDS,
  SEGMENT_IDS,
  SEGMENT_KIND,
  WAGON,
  WORLD_SPEC,
  atDistance,
  atRouteT,
  clampWorldSpec,
  costumeScale,
  costumeSitY,
  inCameraSafe,
  inKeepClear,
  offsetPoint,
  polylineAt,
  segmentIdAt,
  snapDistance,
  snapRouteT,
  wagonClearsModules,
  wagonOnRibbon,
} from "../src/world/spec.ts";
import { ROOT_VFX, VERGE_COUNTS, geo, rootOf, routeX, vergePose } from "../src/world/kit.ts";

const SEGMENTS = [
  "departure-platform",
  "opening-straight",
  "encounter-clearing-a",
  "river-bend",
  "central-clearing",
  "bridge",
  "archive-approach",
];

describe("WorldSpec load and clamp", () => {
  it("loads the authored layout and locks the corridor numbers", () => {
    assert.equal(WORLD_SPEC.worldId, "lexicon-frontier-vertical-slice-v1");
    assert.equal(WORLD_SPEC.length_m, 140);
    assert.equal(WORLD_SPEC.width_m, 6);
    assert.equal(WORLD_SPEC.halfWidth_m, 3);
    assert.equal(WORLD_SPEC.snap_m, 12);
    assert.equal(WORLD_SPEC.keepClear_m, 7);
    assert.equal(WORLD_SPEC.cameraSafe_m, 18);
    assert.deepEqual([...WORLD_SPEC.segments], SEGMENTS);
    assert.deepEqual([...SEGMENT_IDS], SEGMENTS);
    assert.deepEqual([...WORLD_SPEC.reactionZoneIds], ["ink-river-a", "route-memory-a"]);
    assert.deepEqual([...REACTION_ZONE_IDS], ["ink-river-a", "route-memory-a"]);
    assert.deepEqual([...WORLD_SPEC.sceneryRouteT], [0.2, 0.53, 0.73, 1]);
  });

  it("clamps planner-sized outliers to the locked slice", () => {
    const clamped = clampWorldSpec({
      world_id: "rogue",
      route: {
        target_length_m: 900,
        target_width_m: 1,
        camera_safe_width_m: 2,
        segments: ["only-one"],
      },
      anchors: { prompt: { keep_clear_radius_m: 40 } },
      reaction_zones: [{ id: "nope" }],
      encounters: [{ route_t: 9 }],
    });
    assert.equal(clamped.length_m, 140);
    assert.equal(clamped.width_m, 6);
    assert.equal(clamped.keepClear_m, 7);
    assert.equal(clamped.cameraSafe_m, 18);
    assert.deepEqual([...clamped.segments], SEGMENTS);
    assert.deepEqual([...clamped.reactionZoneIds], ["ink-river-a", "route-memory-a"]);
    assert.deepEqual([...clamped.sceneryRouteT], [0.2, 0.53, 0.73, 1]);
  });
});

describe("route helpers", () => {
  it("maps route_t and distance s onto a 140 m centerline", () => {
    const start = atRouteT(0);
    const mid = atRouteT(0.5);
    const end = atRouteT(1);
    const at140 = atDistance(140);
    assert.equal(start.s, 0);
    assert.ok(Number.isFinite(start.x) && Number.isFinite(start.z) && Number.isFinite(start.yaw));
    assert.equal(end.s, 140);
    assert.ok(Math.hypot(end.x - start.x, end.z - start.z) > 130);
    assert.ok(Math.hypot(end.x - start.x, end.z - start.z) < 150);
    assert.equal(at140.s, 140);
    assert.ok(Math.abs(mid.s - 70) < 0.001);
    assert.equal(atRouteT(-2).s, 0);
    assert.equal(atRouteT(4).s, 140);
  });

  it("snaps placements to 12 m", () => {
    assert.equal(snapDistance(0), 0);
    assert.equal(snapDistance(13), 12);
    assert.equal(snapDistance(18), 24);
    assert.equal(snapDistance(140), 144);
    assert.equal(snapRouteT(0.2) * 140, 24);
    assert.equal(snapRouteT(0.53) * 140, 72);
    assert.equal(snapRouteT(0.73) * 140, 108);
    assert.equal(snapRouteT(1), 144 / 140);
  });

  it("names the seven segments and keeps encounter scenery on their spans", () => {
    assert.equal(segmentIdAt(0), "departure-platform");
    assert.equal(segmentIdAt(28), "encounter-clearing-a");
    assert.equal(segmentIdAt(74.2), "central-clearing");
    assert.equal(segmentIdAt(102.2), "bridge");
    assert.equal(segmentIdAt(140), "archive-approach");
    assert.equal(segmentIdAt(atRouteT(0.2).s), "encounter-clearing-a");
    assert.equal(segmentIdAt(atRouteT(0.53).s), "central-clearing");
    assert.equal(segmentIdAt(atRouteT(0.73).s), "bridge");
    assert.equal(segmentIdAt(atRouteT(1).s), "archive-approach");
  });

  it("keeps dressing out of the 18 m camera-safe band and 7 m keep-clear", () => {
    const onRoad = atRouteT(0.2);
    assert.equal(inKeepClear(onRoad.x, onRoad.z), true);
    assert.equal(inCameraSafe(onRoad.x, onRoad.z), true);
    const verge = offsetPoint(28, WORLD_SPEC.halfWidth_m + 0.2);
    assert.equal(inKeepClear(verge.x, verge.z), true);
    const clear = offsetPoint(28, WORLD_SPEC.keepClear_m + 0.2);
    assert.equal(inKeepClear(clear.x, clear.z), false);
    assert.equal(inCameraSafe(clear.x, clear.z), true);
    const outside = offsetPoint(28, WORLD_SPEC.cameraSafe_m / 2 + 0.2);
    assert.equal(inCameraSafe(outside.x, outside.z), false);
    assert.equal(inKeepClear(outside.x, outside.z), false);
  });

  it("keeps routeX on the polyline so the sliding shot stays under the wagon", () => {
    const sample = atDistance(36);
    assert.ok(Math.abs(routeX(sample.z) - sample.x) < 0.05);
    assert.ok(Math.abs(sample.x) < 3);
  });
});

describe("ribbon geometry", () => {
  it("builds a 6 m ribbon whose span covers the 140 m route", () => {
    const pos = geo.road.getAttribute("position");
    assert.ok(pos);
    const left = { x: pos.getX(0), z: pos.getZ(0) };
    const right = { x: pos.getX(1), z: pos.getZ(1) };
    const width = Math.hypot(right.x - left.x, right.z - left.z);
    assert.ok(Math.abs(width - 6) < 0.08);

    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let i = 0; i < pos.count; i += 1) {
      const z = pos.getZ(i);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    assert.ok(maxZ - minZ >= 140);
  });
});

describe("cast root language", () => {
  it("maps the book to the four visible roots", () => {
    assert.equal(rootOf("ignis_ventus"), "fire");
    assert.equal(rootOf("glacies_fractura"), "ice");
    assert.equal(rootOf("fulgur_ventus"), "wind");
    assert.equal(rootOf("terra_ordo"), "earth");
    assert.equal(rootOf("vita_terra"), "earth");
    assert.equal(rootOf("lumen_aqua"), "ice");
    assert.equal(rootOf("umbra_mors"), "fire");
  });

  it("keeps each root VFX large enough to read from the gameplay camera", () => {
    for (const root of ["fire", "ice", "wind", "earth"]) {
      assert.ok(ROOT_VFX[root].span >= 1.4, `${root} span`);
      assert.ok(ROOT_VFX[root].height >= 0.28, `${root} height`);
    }
  });
});

describe("sliding wagon vs module decks", () => {
  it("keeps the wagon footprint on the 6 m ribbon for the whole 140 m slide", () => {
    for (let s = 0; s <= WORLD_SPEC.length_m; s += 2) {
      assert.equal(wagonOnRibbon(s), true, `s=${s} roadX=${polylineAt(s).x}`);
    }
  });

  it("keeps wagon feet above the authored module-deck top", () => {
    assert.equal(wagonClearsModules(), true);
    assert.ok(MODULE_DECK.topY <= 0.06);
    assert.ok(WAGON.y + WAGON.footLocalY * WAGON.scale >= MODULE_DECK.topY);
  });
});

describe("F-016 lectern lip", () => {
  it("starts the cast toward the well, in front of the lectern lip", () => {
    assert.ok(CAST_FX.startZ < CAST_FX.lecternLipZ);
    assert.ok(CAST_FX.startY >= 1.4);
    assert.ok(CAST_FX.startZ < 0);
  });
});

describe("dense verge dressing", () => {
  it("plants more grass, flowers, and shrubs outside keep-clear and camera-safe", () => {
    assert.ok(VERGE_COUNTS.grass >= 360);
    assert.ok(VERGE_COUNTS.flower >= 180);
    assert.ok(VERGE_COUNTS.shrub >= 80);
    for (const kind of ["grass", "flower", "shrub"]) {
      const count = VERGE_COUNTS[kind];
      for (let i = 0; i < count; i += 1) {
        const pose = vergePose(i, kind);
        assert.equal(inKeepClear(pose.x, pose.z), false, `${kind} ${i} keep-clear`);
        assert.equal(inCameraSafe(pose.x, pose.z), false, `${kind} ${i} camera-safe`);
        assert.ok(pose.distance >= WORLD_SPEC.cameraSafe_m / 2);
      }
    }
  });

  it("keeps monoliths outside the camera-safe half-width", () => {
    for (const pose of BAKED_PLACEMENTS.monoliths) {
      assert.equal(inCameraSafe(pose.x, pose.z), false);
      assert.equal(inKeepClear(pose.x, pose.z), false);
    }
  });

  it("keeps the shrine and ramp outside camera-safe and keep-clear", () => {
    for (const pose of [BAKED_PLACEMENTS.shrine, BAKED_PLACEMENTS.ramp]) {
      assert.equal(inCameraSafe(pose.x, pose.z), false);
      assert.equal(inKeepClear(pose.x, pose.z), false);
    }
  });
});

describe("segment identity", () => {
  it("names a module kind for every locked segment", () => {
    assert.deepEqual(Object.keys(SEGMENT_KIND), SEGMENTS);
    assert.equal(SEGMENT_KIND["departure-platform"], "waymark-dock");
    assert.equal(SEGMENT_KIND["encounter-clearing-a"], "clearing");
    assert.equal(SEGMENT_KIND["central-clearing"], "clearing");
    assert.equal(SEGMENT_KIND["river-bend"], "bend-river");
    assert.equal(SEGMENT_KIND["bridge"], "bridge");
  });
});

describe("pilot costume fit", () => {
  it("maps the three pilots onto local public URLs and stand-in heights", () => {
    assert.equal(PILOT_COSTUMES.golem.url, "/assets/models/cooldown-golem.glb");
    assert.equal(PILOT_COSTUMES.goose.url, "/assets/models/misfire-goose.glb");
    assert.equal(PILOT_COSTUMES.scriptorium.url, "/assets/models/traveling-scriptorium.glb");
    assert.ok(PILOT_COSTUMES.golem.targetHeight_m >= 2.4);
    assert.ok(PILOT_COSTUMES.goose.targetHeight_m >= 1.2);
    assert.ok(PILOT_COSTUMES.scriptorium.targetHeight_m >= 2.8);
  });

  it("fits a unit-cube Tripo mesh onto the stand-in height and foot", () => {
    const sourceHeight = 2;
    const golem = PILOT_COSTUMES.golem;
    const scale = costumeScale(sourceHeight, golem.targetHeight_m);
    assert.equal(scale, golem.targetHeight_m / 2);
    const sit = costumeSitY(-1 * scale, golem.footY);
    assert.ok(Math.abs(sit - (golem.targetHeight_m / 2 + golem.footY)) < 1e-9);
    assert.equal(costumeScale(0, 2), 1);
  });
});
