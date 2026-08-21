import layoutFile from "../../assets/SPELLCHECK_2D_Asset_Package_v1.1/WORLD_LAYOUT_SPEC.json";

export const SEGMENT_IDS = [
  "departure-platform",
  "opening-straight",
  "encounter-clearing-a",
  "river-bend",
  "central-clearing",
  "bridge",
  "archive-approach",
] as const;

export const REACTION_ZONE_IDS = ["ink-river-a", "route-memory-a"] as const;

export const SCENERY_ROUTE_T = [0.2, 0.53, 0.73, 1] as const;

const LOCKED = {
  worldId: "lexicon-frontier-vertical-slice-v1",
  length_m: 140,
  width_m: 6,
  halfWidth_m: 3,
  snap_m: 12,
  keepClear_m: 7,
  cameraSafe_m: 18,
} as const;

const SEGMENT_SPANS: ReadonlyArray<{ id: (typeof SEGMENT_IDS)[number]; start: number; end: number }> =
  [
    { id: "departure-platform", start: 0, end: 12 },
    { id: "opening-straight", start: 12, end: 24 },
    { id: "encounter-clearing-a", start: 24, end: 40 },
    { id: "river-bend", start: 40, end: 68 },
    { id: "central-clearing", start: 68, end: 88 },
    { id: "bridge", start: 88, end: 116 },
    { id: "archive-approach", start: 116, end: 140 },
  ];

export type SegmentId = (typeof SEGMENT_IDS)[number];

export type RoutePose = {
  x: number;
  z: number;
  yaw: number;
  s: number;
};

export type WorldSpec = {
  worldId: string;
  length_m: number;
  width_m: number;
  halfWidth_m: number;
  snap_m: number;
  keepClear_m: number;
  cameraSafe_m: number;
  segments: readonly SegmentId[];
  reactionZoneIds: readonly (typeof REACTION_ZONE_IDS)[number][];
  sceneryRouteT: readonly number[];
};

type RawLayout = {
  world_id?: string;
  route?: {
    target_length_m?: number;
    target_width_m?: number;
    camera_safe_width_m?: number;
    segments?: string[];
  };
  anchors?: { prompt?: { keep_clear_radius_m?: number } };
  reaction_zones?: { id?: string }[];
  encounters?: { route_t?: number }[];
};

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/** Locked slice numbers. Incoming planner values are discarded, not averaged. */
export function clampWorldSpec(_raw?: RawLayout | null): WorldSpec {
  return {
    worldId: LOCKED.worldId,
    length_m: LOCKED.length_m,
    width_m: LOCKED.width_m,
    halfWidth_m: LOCKED.halfWidth_m,
    snap_m: LOCKED.snap_m,
    keepClear_m: LOCKED.keepClear_m,
    cameraSafe_m: LOCKED.cameraSafe_m,
    segments: SEGMENT_IDS,
    reactionZoneIds: REACTION_ZONE_IDS,
    sceneryRouteT: SCENERY_ROUTE_T,
  };
}

export const WORLD_SPEC: WorldSpec = clampWorldSpec(layoutFile as RawLayout);

/** Gentle -Z corridor. Amplitude stays inside the 6 m road so the sliding wagon never leaves the ribbon. */
export function polylineAt(s: number): { x: number; z: number; yaw: number } {
  const x = -0.72 + Math.sin(s * 0.08) * 1.05 + Math.sin(s * 0.028) * 0.38;
  const z = -s;
  const dx = 0.08 * 1.05 * Math.cos(s * 0.08) + 0.028 * 0.38 * Math.cos(s * 0.028);
  const yaw = Math.atan2(dx, 1);
  return { x, z, yaw };
}

export function atDistance(s: number): RoutePose {
  const clamped = clamp(s, 0, WORLD_SPEC.length_m);
  const pose = polylineAt(clamped);
  return { ...pose, s: clamped };
}

export function atRouteT(t: number): RoutePose {
  return atDistance(t * WORLD_SPEC.length_m);
}

export function snapDistance(s: number): number {
  return Math.round(s / WORLD_SPEC.snap_m) * WORLD_SPEC.snap_m;
}

export function snapRouteT(t: number): number {
  return snapDistance(t * WORLD_SPEC.length_m) / WORLD_SPEC.length_m;
}

export function segmentIdAt(s: number): SegmentId {
  const clamped = clamp(s, 0, WORLD_SPEC.length_m);
  for (const span of SEGMENT_SPANS) {
    if (clamped <= span.end) {
      return span.id;
    }
  }
  return "archive-approach";
}

export function segmentMid(id: SegmentId): number {
  const span = SEGMENT_SPANS.find((row) => row.id === id);
  if (!span) {
    return 0;
  }
  return (span.start + span.end) * 0.5;
}

export function offsetPoint(s: number, lateral: number): RoutePose {
  const pose = atDistance(s);
  return {
    x: pose.x + lateral * Math.cos(pose.yaw),
    z: pose.z + lateral * Math.sin(pose.yaw),
    yaw: pose.yaw,
    s: pose.s,
  };
}

function lateralDistance(x: number, z: number): number {
  const pose = atDistance(-z);
  return Math.hypot(x - pose.x, z - pose.z);
}

export function inKeepClear(x: number, z: number): boolean {
  return lateralDistance(x, z) < WORLD_SPEC.keepClear_m;
}

export function inCameraSafe(x: number, z: number): boolean {
  return lateralDistance(x, z) < WORLD_SPEC.cameraSafe_m / 2;
}

export const SEGMENT_KIND = {
  "departure-platform": "waymark-dock",
  "opening-straight": "straight",
  "encounter-clearing-a": "clearing",
  "river-bend": "bend-river",
  "central-clearing": "clearing",
  "bridge": "bridge",
  "archive-approach": "straight",
} as const;

export const BAKED_PLACEMENTS = {
  departure: atRouteT(0),
  /** Facade sits 12 m past t=1 so the sliding win shot keeps the wagon in frame. */
  archive: { ...atRouteT(1), z: atRouteT(1).z - 12 },
  scenery: SCENERY_ROUTE_T.map((t) => ({ t, ...atRouteT(t), snapped: snapDistance(t * WORLD_SPEC.length_m) })),
  monoliths: [24, 60, 96, 120].map((s, i) =>
    offsetPoint(s, (i % 2 === 0 ? -1 : 1) * (WORLD_SPEC.cameraSafe_m / 2 + 1.4)),
  ),
  shrine: offsetPoint(segmentMid("central-clearing"), WORLD_SPEC.cameraSafe_m / 2 + 2.6),
  ramp: offsetPoint(segmentMid("archive-approach"), -(WORLD_SPEC.cameraSafe_m / 2 + 2.0)),
};

/** First-pass Tripo pilots. Meshes are unit-normalized (~2 m cube); scale to the stand-in. */
export const PILOT_COSTUMES = {
  golem: {
    id: "cooldown-golem",
    url: "/assets/models/cooldown-golem.glb",
    targetHeight_m: 2.7,
    yaw: 0,
    footY: -0.79,
  },
  goose: {
    id: "misfire-goose",
    url: "/assets/models/misfire-goose.glb",
    targetHeight_m: 1.55,
    yaw: 0,
    footY: -0.69,
  },
  scriptorium: {
    id: "traveling-scriptorium",
    url: "/assets/models/traveling-scriptorium.glb",
    targetHeight_m: 3.15,
    yaw: Math.PI,
    footY: -0.21,
  },
} as const;

export type PilotCostumeId = keyof typeof PILOT_COSTUMES;

export function costumeScale(sourceHeight: number, targetHeight: number): number {
  if (!(sourceHeight > 0)) {
    return 1;
  }
  return targetHeight / sourceHeight;
}

export function costumeSitY(scaledMinY: number, footY = 0): number {
  return -scaledMinY + footY;
}

/** Stationary Scriptorium. X sits inside the ribbon for every polyline sample. */
export const WAGON = {
  x: -1.08,
  y: 0.26,
  z: -0.28,
  yaw: 0.03,
  scale: 0.86,
  halfWidth: 1.25,
  footLocalY: -0.21,
} as const;

/** Module pavers stay flush with the ribbon so the sliding shot cannot clip the hull. */
export const MODULE_DECK = {
  topY: 0.055,
} as const;

/** Cast starts at the podium and travels toward the well, never back through the HUD band. */
export const CAST_FX = {
  startX: -0.86,
  startY: 1.62,
  startZ: -1.48,
  lecternLipZ: -0.72,
} as const;

export function wagonOnRibbon(s: number): boolean {
  const road = polylineAt(s);
  const half = WAGON.halfWidth * WAGON.scale;
  return Math.abs(WAGON.x - road.x) + half <= WORLD_SPEC.halfWidth_m;
}

export function wagonClearsModules(): boolean {
  return WAGON.y + WAGON.footLocalY * WAGON.scale >= MODULE_DECK.topY;
}
