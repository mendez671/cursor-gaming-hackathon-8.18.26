import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  DoubleSide,
  Float32BufferAttribute,
  IcosahedronGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
} from "three";
import { WORLD_SPEC, offsetPoint, polylineAt, type RoutePose } from "./spec";

export function routeX(z: number): number {
  return polylineAt(-z).x;
}

function ribbon(halfWidth: number, y = 0): BufferGeometry {
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const startS = -4;
  const endS = WORLD_SPEC.length_m + 8;
  const segments = 148;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const s = startS + (endS - startS) * t;
    const pose = polylineAt(s);
    const nx = Math.cos(pose.yaw);
    const nz = Math.sin(pose.yaw);
    positions.push(
      pose.x - nx * halfWidth,
      y,
      pose.z - nz * halfWidth,
      pose.x + nx * halfWidth,
      y,
      pose.z + nz * halfWidth,
    );
    uvs.push(0, t * 12, 1, t * 12);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Shared geometries — never allocate these in render or useFrame. */
export const geo = {
  box: new BoxGeometry(1, 1, 1),
  sphere: new SphereGeometry(0.5, 12, 10),
  sphereHi: new SphereGeometry(0.5, 16, 12),
  cone: new ConeGeometry(0.5, 1, 7),
  cyl: new CylinderGeometry(0.5, 0.5, 1, 8),
  cylTaper: new CylinderGeometry(0.42, 0.55, 1, 8),
  hex: new CylinderGeometry(0.5, 0.5, 0.14, 6),
  disc: new CylinderGeometry(0.5, 0.5, 0.05, 14),
  plane: new PlaneGeometry(1, 1),
  torus: new TorusGeometry(0.5, 0.07, 8, 18),
  octa: new OctahedronGeometry(0.5, 0),
  capsule: new CapsuleGeometry(0.5, 0.8, 4, 8),
  dodeca: new DodecahedronGeometry(0.5, 0),
  icosa: new IcosahedronGeometry(0.5, 0),
  tetra: new TetrahedronGeometry(0.5, 0),
  ring: new RingGeometry(0.32, 0.5, 18),
  road: ribbon(WORLD_SPEC.halfWidth_m, 0.025),
  roadEdge: ribbon(WORLD_SPEC.halfWidth_m + 0.22, 0.005),
  sky: new SphereGeometry(1, 20, 12),
};

/** Shared materials — mutate properties on clones, not these, when fading. */
export const mat = {
  sky: new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new Color("#35536c") },
      horizonColor: { value: new Color("#efab62") },
      groundColor: { value: new Color("#61432e") },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = normalize(world.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorld;
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 groundColor;
      void main() {
        float upper = smoothstep(-0.05, 0.72, vWorld.y);
        float lower = smoothstep(-0.8, -0.04, vWorld.y);
        vec3 color = mix(groundColor, horizonColor, lower);
        color = mix(color, topColor, upper);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }),
  sun: new MeshBasicMaterial({
    color: "#ffe5a1",
    transparent: true,
    opacity: 0.9,
    fog: false,
  }),
  haze: new MeshBasicMaterial({
    color: "#e6a765",
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    side: DoubleSide,
  }),
  cloud: new MeshBasicMaterial({
    color: "#ffe7bd",
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: DoubleSide,
  }),
  meadow: new MeshStandardMaterial({
    color: "#719267",
    roughness: 0.94,
    metalness: 0,
  }),
  meadowDeep: new MeshStandardMaterial({
    color: "#4f7154",
    roughness: 0.96,
    metalness: 0,
  }),
  path: new MeshStandardMaterial({
    color: "#d3bc91",
    roughness: 0.86,
    metalness: 0.04,
  }),
  roadEdge: new MeshStandardMaterial({
    color: "#6b5740",
    roughness: 0.98,
    metalness: 0,
  }),
  paver: new MeshStandardMaterial({
    color: "#c8aa7c",
    roughness: 0.9,
    metalness: 0.02,
  }),
  soil: new MeshStandardMaterial({
    color: "#6c5238",
    roughness: 0.96,
    metalness: 0,
  }),
  wood: new MeshStandardMaterial({
    color: "#714425",
    roughness: 0.78,
    metalness: 0.04,
  }),
  woodDark: new MeshStandardMaterial({
    color: "#3d2414",
    roughness: 0.86,
    metalness: 0.02,
  }),
  navy: new MeshStandardMaterial({
    color: "#1a2748",
    roughness: 0.72,
    metalness: 0.06,
  }),
  navyDeep: new MeshStandardMaterial({
    color: "#101828",
    roughness: 0.8,
    metalness: 0.04,
  }),
  vellum: new MeshStandardMaterial({
    color: "#e6d6b8",
    roughness: 0.72,
    metalness: 0,
  }),
  parchment: new MeshStandardMaterial({
    color: "#d8c4a0",
    roughness: 0.8,
    metalness: 0,
  }),
  ink: new MeshStandardMaterial({
    color: "#1c140c",
    roughness: 0.82,
    metalness: 0,
  }),
  inkCorrupt: new MeshStandardMaterial({
    color: "#1a0e28",
    roughness: 0.48,
    metalness: 0.08,
    emissive: "#2a1040",
    emissiveIntensity: 0.35,
  }),
  eye: new MeshStandardMaterial({
    color: "#e8a0ff",
    roughness: 0.22,
    metalness: 0.12,
    emissive: "#c84cff",
    emissiveIntensity: 1.15,
  }),
  comma: new MeshStandardMaterial({
    color: "#f4e8d4",
    roughness: 0.4,
    metalness: 0,
    emissive: "#e8d4b0",
    emissiveIntensity: 0.35,
  }),
  brass: new MeshStandardMaterial({
    color: "#b9853f",
    roughness: 0.42,
    metalness: 0.38,
    emissive: "#4a3514",
    emissiveIntensity: 0.28,
  }),
  copperDark: new MeshStandardMaterial({
    color: "#704225",
    roughness: 0.48,
    metalness: 0.32,
  }),
  window: new MeshStandardMaterial({
    color: "#8de8eb",
    roughness: 0.18,
    metalness: 0.08,
    emissive: "#2aa8bb",
    emissiveIntensity: 1.1,
    transparent: true,
    opacity: 0.88,
  }),
  stone: new MeshStandardMaterial({
    color: "#8a7d6c",
    roughness: 0.92,
    metalness: 0.06,
  }),
  slab: new MeshStandardMaterial({
    color: "#d2c4a8",
    roughness: 0.88,
    metalness: 0.04,
  }),
  stoneLit: new MeshStandardMaterial({
    color: "#4a4034",
    roughness: 0.7,
    metalness: 0.12,
    emissive: "#c4a35a",
    emissiveIntensity: 0.32,
  }),
  stoneDim: new MeshStandardMaterial({
    color: "#221c16",
    roughness: 0.96,
    metalness: 0,
    emissive: "#000000",
    emissiveIntensity: 0,
  }),
  mountain: new MeshStandardMaterial({
    color: "#8d7258",
    roughness: 0.9,
    metalness: 0.04,
  }),
  archive: new MeshStandardMaterial({
    color: "#806852",
    roughness: 0.78,
    metalness: 0.1,
  }),
  archDark: new MeshStandardMaterial({
    color: "#1a1410",
    roughness: 0.95,
    metalness: 0,
  }),
  ember: new MeshStandardMaterial({
    color: "#b4532a",
    roughness: 0.52,
    metalness: 0.08,
    emissive: "#b4532a",
    emissiveIntensity: 0.42,
  }),
  frost: new MeshStandardMaterial({
    color: "#8ec8d4",
    roughness: 0.34,
    metalness: 0.12,
    emissive: "#3a7088",
    emissiveIntensity: 0.4,
  }),
  ice: new MeshStandardMaterial({
    color: "#7ec8e3",
    roughness: 0.22,
    metalness: 0.18,
    emissive: "#3a88aa",
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.88,
  }),
  iceDeep: new MeshStandardMaterial({
    color: "#315c79",
    roughness: 0.4,
    metalness: 0.1,
    emissive: "#143048",
    emissiveIntensity: 0.28,
  }),
  inkWet: new MeshStandardMaterial({
    color: "#1b102d",
    roughness: 0.18,
    metalness: 0.2,
    emissive: "#240d38",
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.96,
  }),
  wind: new MeshStandardMaterial({
    color: "#c9d4c0",
    roughness: 0.62,
    metalness: 0,
    emissive: "#6a7a60",
    emissiveIntensity: 0.28,
  }),
  tide: new MeshStandardMaterial({
    color: "#6a9aaa",
    roughness: 0.48,
    metalness: 0.08,
    emissive: "#244858",
    emissiveIntensity: 0.3,
  }),
  soot: new MeshStandardMaterial({
    color: "#2a2430",
    roughness: 0.82,
    metalness: 0.1,
    emissive: "#1a1020",
    emissiveIntensity: 0.22,
  }),
  verdure: new MeshStandardMaterial({
    color: "#4a6a48",
    roughness: 0.8,
    metalness: 0,
    emissive: "#1a2a18",
    emissiveIntensity: 0.18,
  }),
  goose: new MeshStandardMaterial({
    color: "#f2eee6",
    roughness: 0.86,
    metalness: 0,
  }),
  beak: new MeshStandardMaterial({
    color: "#d4782a",
    roughness: 0.58,
    metalness: 0,
  }),
  coat: new MeshStandardMaterial({
    color: "#1c2a4c",
    roughness: 0.7,
    metalness: 0.05,
  }),
  skin: new MeshStandardMaterial({
    color: "#c4a07a",
    roughness: 0.72,
    metalness: 0,
  }),
  hair: new MeshStandardMaterial({
    color: "#2a1c14",
    roughness: 0.9,
    metalness: 0,
  }),
  trousers: new MeshStandardMaterial({
    color: "#2a2430",
    roughness: 0.86,
    metalness: 0,
  }),
  leather: new MeshStandardMaterial({
    color: "#5a3820",
    roughness: 0.8,
    metalness: 0.04,
  }),
  bardHead: new MeshStandardMaterial({
    color: "#f4f0e6",
    roughness: 0.55,
    metalness: 0,
    emissive: "#d8e8e8",
    emissiveIntensity: 0.12,
  }),
  bardEye: new MeshStandardMaterial({
    color: "#7ef0ff",
    roughness: 0.2,
    metalness: 0.1,
    emissive: "#3ad8e8",
    emissiveIntensity: 0.95,
  }),
  rune: new MeshStandardMaterial({
    color: "#6ad8ff",
    roughness: 0.28,
    metalness: 0.16,
    emissive: "#2a88d8",
    emissiveIntensity: 0.85,
  }),
  runeViolet: new MeshStandardMaterial({
    color: "#c89cff",
    roughness: 0.28,
    metalness: 0.14,
    emissive: "#7a38c8",
    emissiveIntensity: 0.8,
  }),
  runeFlat: new MeshBasicMaterial({
    color: "#74e7ff",
    transparent: true,
    opacity: 0.88,
    blending: AdditiveBlending,
    depthWrite: false,
  }),
  runeVioletFlat: new MeshBasicMaterial({
    color: "#d28cff",
    transparent: true,
    opacity: 0.82,
    blending: AdditiveBlending,
    depthWrite: false,
  }),
  spark: new MeshBasicMaterial({
    color: "#fff0b0",
    transparent: true,
    opacity: 0.92,
    blending: AdditiveBlending,
    depthWrite: false,
  }),
  flower: new MeshStandardMaterial({
    color: "#4a8cff",
    roughness: 0.45,
    metalness: 0,
    emissive: "#2468d8",
    emissiveIntensity: 0.35,
  }),
  tuft: new MeshStandardMaterial({
    color: "#4f8a3c",
    roughness: 1,
    metalness: 0,
  }),
  tuftDark: new MeshStandardMaterial({
    color: "#2f5a2a",
    roughness: 1,
    metalness: 0,
  }),
  tuftTeal: new MeshStandardMaterial({
    color: "#2b7774",
    roughness: 0.96,
    metalness: 0,
  }),
  tuftAmber: new MeshStandardMaterial({
    color: "#99753d",
    roughness: 0.98,
    metalness: 0,
  }),
  lamp: new MeshStandardMaterial({
    color: "#e8c878",
    roughness: 0.28,
    metalness: 0.2,
    emissive: "#c4a35a",
    emissiveIntensity: 0.85,
  }),
  smoke: new MeshStandardMaterial({
    color: "#f4f0e8",
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.38,
  }),
  bookRed: new MeshStandardMaterial({
    color: "#7a2a22",
    roughness: 0.7,
    metalness: 0,
  }),
  bookGreen: new MeshStandardMaterial({
    color: "#2a4a32",
    roughness: 0.7,
    metalness: 0,
  }),
  bookBlue: new MeshStandardMaterial({
    color: "#243a68",
    roughness: 0.7,
    metalness: 0,
  }),
  shade: new MeshStandardMaterial({
    color: "#0b0907",
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.38,
  }),
  cover: new MeshStandardMaterial({
    color: "#d8c8a8",
    roughness: 0.62,
    metalness: 0.08,
  }),
  bannerCloth: new MeshStandardMaterial({
    color: "#1a2748",
    roughness: 0.7,
    metalness: 0.04,
    side: DoubleSide,
  }),
  wagonArt: new MeshStandardMaterial({
    color: "#c4ae88",
    roughness: 0.78,
    metalness: 0,
  }),
  paper: new MeshStandardMaterial({
    color: "#e6d6b8",
    roughness: 0.74,
    metalness: 0,
    side: DoubleSide,
  }),
  charmFire: new MeshStandardMaterial({
    color: "#e85a28",
    roughness: 0.4,
    metalness: 0.12,
    emissive: "#c43810",
    emissiveIntensity: 0.7,
  }),
  charmIce: new MeshStandardMaterial({
    color: "#7ee8f0",
    roughness: 0.32,
    metalness: 0.14,
    emissive: "#2aa8c8",
    emissiveIntensity: 0.65,
  }),
  charmWind: new MeshStandardMaterial({
    color: "#9ad8c8",
    roughness: 0.45,
    metalness: 0.06,
    emissive: "#3a8878",
    emissiveIntensity: 0.5,
  }),
  charmEarth: new MeshStandardMaterial({
    color: "#5aaa48",
    roughness: 0.55,
    metalness: 0.04,
    emissive: "#2a6820",
    emissiveIntensity: 0.45,
  }),
  charmLight: new MeshStandardMaterial({
    color: "#f0e0a0",
    roughness: 0.35,
    metalness: 0.1,
    emissive: "#c8a838",
    emissiveIntensity: 0.7,
  }),
  charmShadow: new MeshStandardMaterial({
    color: "#5a3878",
    roughness: 0.5,
    metalness: 0.08,
    emissive: "#3a1858",
    emissiveIntensity: 0.55,
  }),
  charmDim: new MeshStandardMaterial({
    color: "#2a241c",
    roughness: 0.94,
    metalness: 0,
    emissive: "#000000",
    emissiveIntensity: 0,
  }),
  scorch: new MeshStandardMaterial({
    color: "#2a1610",
    roughness: 0.92,
    metalness: 0.04,
    emissive: "#b4532a",
    emissiveIntensity: 0.38,
  }),
  fireArc: new MeshBasicMaterial({
    color: "#ffb14a",
    transparent: true,
    opacity: 0.92,
    blending: AdditiveBlending,
    depthWrite: false,
  }),
  windTeal: new MeshBasicMaterial({
    color: "#9ef0e0",
    transparent: true,
    opacity: 0.86,
    blending: AdditiveBlending,
    depthWrite: false,
  }),
  earthGlow: new MeshStandardMaterial({
    color: "#7ec85a",
    roughness: 0.4,
    metalness: 0.06,
    emissive: "#3a8a20",
    emissiveIntensity: 0.7,
  }),
};

export type CharmKey =
  | "charmFire"
  | "charmIce"
  | "charmWind"
  | "charmEarth"
  | "charmLight"
  | "charmShadow";

export function charmOf(spellId: string): CharmKey {
  if (spellId.includes("umbra") || spellId.includes("mors")) {
    return "charmShadow";
  }
  if (spellId.includes("lumen") || spellId.includes("ordo")) {
    return "charmLight";
  }
  if (spellId.includes("terra") || spellId.includes("vita")) {
    return "charmEarth";
  }
  if (spellId.includes("glacies") || spellId.includes("aqua")) {
    return "charmIce";
  }
  if (spellId.includes("ventus") && !spellId.includes("ignis")) {
    return "charmWind";
  }
  if (spellId.includes("ignis") || spellId.includes("fulgur")) {
    return "charmFire";
  }
  return "charmLight";
}

export type SpellFamilyMaterialKey =
  | "frost"
  | "soot"
  | "tide"
  | "verdure"
  | "wind"
  | "ember"
  | "brass";

export type SpellRoot = "fire" | "ice" | "wind" | "earth";

export function rootOf(spellId: string): SpellRoot {
  if (spellId.includes("glacies") || spellId.includes("aqua")) {
    return "ice";
  }
  if (spellId.includes("terra") || spellId.includes("vita")) {
    return "earth";
  }
  if (spellId.includes("ventus") && !spellId.includes("ignis")) {
    return "wind";
  }
  return "fire";
}

export function familyOf(spellId: string): SpellFamilyMaterialKey {
  if (spellId.includes("glacies") || spellId.includes("aqua")) {
    return "frost";
  }
  if (spellId.includes("umbra") || spellId.includes("mors")) {
    return "soot";
  }
  if (spellId.includes("lumen")) {
    return "tide";
  }
  if (spellId.includes("vita")) {
    return "verdure";
  }
  if (spellId.includes("ventus") && !spellId.includes("ignis")) {
    return "wind";
  }
  if (spellId.includes("ignis")) {
    return "ember";
  }
  if (spellId.includes("terra")) {
    return "verdure";
  }
  return "brass";
}

export type Silhouette = "ink" | "golem" | "hound" | "swarm" | "wyrm";

export function silhouetteOf(kind: string): Silhouette {
  if (kind === "armored") {
    return "golem";
  }
  if (kind === "charging" || kind === "approaching") {
    return "hound";
  }
  if (kind === "swarm") {
    return "swarm";
  }
  if (kind === "elite") {
    return "wyrm";
  }
  return "ink";
}

export function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const VERGE_COUNTS = {
  grass: 380,
  flower: 200,
  shrub: 96,
} as const;

export type VergeKind = keyof typeof VERGE_COUNTS;

export function vergeLateral(i: number, kind: VergeKind): number {
  const min = WORLD_SPEC.cameraSafe_m / 2 + 0.45;
  const span = kind === "grass" ? 10.2 : kind === "flower" ? 6.4 : 8.0;
  return min + ((i % 11) / 11) * span + seeded(i + 17) * 1.5;
}

export function vergePose(i: number, kind: VergeKind): RoutePose & { distance: number } {
  const seedBase = kind === "grass" ? 4 : kind === "flower" ? 9 : 21;
  const extra = kind === "grass" ? 10 : kind === "flower" ? 6 : 8;
  const s = seeded(i + seedBase) * (WORLD_SPEC.length_m + extra);
  const side = i % 2 === 0 ? -1 : 1;
  const distance = vergeLateral(i, kind);
  return { ...offsetPoint(s, side * distance), distance };
}

export const ROOT_VFX = {
  fire: { span: 1.85, height: 0.42 },
  ice: { span: 2.45, height: 0.52 },
  wind: { span: 1.7, height: 0.36 },
  earth: { span: 1.62, height: 0.4 },
} as const;
