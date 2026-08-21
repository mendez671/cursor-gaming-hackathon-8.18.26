import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { SPELLS } from "../game/content";
import {
  ArchiveLandmark,
  ClearingGround,
  DeparturePad,
  FloatingIsle,
  Honk,
  IcePatch,
  InkRiver,
  InkSprite,
  InkSwarm,
  Monolith,
  ParchmentHound,
  RoadLantern,
  RouteBend,
  RouteBridge,
  RouteEdge,
  RouteStraight,
  RuneArc,
  RunicGolem,
  ScrollWyrm,
  TerraceRamp,
  WalkingScriptorium,
  WordlockShrine,
} from "./art";
import {
  ROOT_VFX,
  VERGE_COUNTS,
  charmOf,
  familyOf,
  geo,
  mat,
  rootOf,
  seeded,
  silhouetteOf,
  vergePose,
} from "./kit";
import {
  BAKED_PLACEMENTS,
  CAST_FX,
  WORLD_SPEC,
  atDistance,
  offsetPoint,
  segmentMid,
} from "./spec";
import { DetailTextures } from "./tex";
import type { WorldView } from "./view";

const ROUTE = WORLD_SPEC.length_m;
const GRASS = VERGE_COUNTS.grass;
const FLOWERS = VERGE_COUNTS.flower;
const SHRUBS = VERGE_COUNTS.shrub;
const PAVERS = 500;
const PAVER_LANES = 5;
const SCARS = 8;
const ARCS = 9;
const dummy = new Object3D();

const CAM = { x: 7.35, y: 5.55, z: 9.4 };
const LOOK = { x: -0.45, y: 1.0, z: -4.8 };

function prefersFreeze(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Tree({
  position,
  scale = 1,
  teal = false,
}: {
  position: [number, number, number];
  scale?: number;
  teal?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geo.cyl} material={mat.woodDark} position={[0, 0.58, 0]} scale={[0.16, 1.16, 0.16]} />
      <mesh geometry={geo.cone} material={teal ? mat.tuftTeal : mat.tuftDark} position={[0, 1.48, 0]} scale={[0.72, 1.25, 0.72]} />
      <mesh geometry={geo.dodeca} material={teal ? mat.tuftTeal : mat.tuft} position={[-0.32, 1.7, 0.08]} scale={[0.52, 0.62, 0.46]} />
      <mesh geometry={geo.dodeca} material={teal ? mat.tuft : mat.tuftAmber} position={[0.3, 1.75, -0.04]} scale={[0.48, 0.58, 0.43]} />
    </group>
  );
}

function RuinArch({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh geometry={geo.dodeca} material={mat.stone} position={[-0.72, 0.1, 0]} scale={[0.55, 0.22, 0.5]} />
      <mesh geometry={geo.dodeca} material={mat.stone} position={[0.72, 0.1, 0]} scale={[0.55, 0.22, 0.5]} />
      <mesh geometry={geo.cyl} material={mat.slab} position={[-0.7, 1.15, 0]} scale={[0.22, 2.2, 0.22]} />
      <mesh geometry={geo.cyl} material={mat.slab} position={[0.7, 1.15, 0]} scale={[0.22, 2.2, 0.22]} />
      <mesh geometry={geo.torus} material={mat.slab} position={[0, 2.05, 0]} scale={[1.0, 1.0, 0.32]} />
      <mesh geometry={geo.ring} material={mat.runeVioletFlat} position={[0, 2.05, 0.12]} scale={0.72} />
      <mesh geometry={geo.box} material={mat.verdure} position={[-0.68, 1.45, 0.24]} scale={[0.24, 0.18, 0.08]} rotation={[0, 0, 0.1]} />
    </group>
  );
}

function TerrainShelf({
  position,
  scale,
  deep = false,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  deep?: boolean;
}) {
  return (
    <group position={position}>
      <mesh geometry={geo.dodeca} material={deep ? mat.meadowDeep : mat.meadow} scale={scale} />
      <mesh
        geometry={geo.dodeca}
        material={mat.soil}
        position={[0, -scale[1] * 0.62, 0]}
        scale={[scale[0] * 0.94, scale[1] * 0.65, scale[2] * 0.94]}
      />
    </group>
  );
}

export function StorybookFrontier({
  viewRef,
}: {
  viewRef: RefObject<WorldView | null>;
}) {
  const world = useRef<Group>(null);
  const deck = useRef<Group>(null);
  const threat = useRef<Group>(null);
  const ink = useRef<Group>(null);
  const golem = useRef<Group>(null);
  const hound = useRef<Group>(null);
  const swarm = useRef<Group>(null);
  const wyrm = useRef<Group>(null);
  const goose = useRef<Group>(null);
  const smoke = useRef<Group>(null);
  const bard = useRef<Group>(null);
  const projectile = useRef<Group>(null);
  const projectileCore = useRef<Mesh>(null);
  const impact = useRef<Group>(null);
  const vfxFire = useRef<Group>(null);
  const vfxIce = useRef<Group>(null);
  const vfxWind = useRef<Group>(null);
  const vfxEarth = useRef<Group>(null);
  const vfxRoot = useRef<ReturnType<typeof rootOf>>("fire");
  const grimoireGlow = useRef<Mesh>(null);
  const grass = useRef<InstancedMesh>(null);
  const flowers = useRef<InstancedMesh>(null);
  const shrubs = useRef<InstancedMesh>(null);
  const pavers = useRef<InstancedMesh>(null);
  const legs = useRef<(Group | null)[]>([]);
  const shins = useRef<(Group | null)[]>([]);
  const stones = useRef<(Mesh | null)[]>([]);
  const arcMarks = useRef<(Mesh | null)[]>([]);
  const scarMesh = useRef<(Mesh | null)[]>([]);
  const scarCrystal = useRef<(Group | null)[]>([]);
  const scarEmber = useRef<(Group | null)[]>([]);
  const scarWind = useRef<(Group | null)[]>([]);
  const scarEarth = useRef<(Group | null)[]>([]);
  const scarMat = useRef<MeshStandardMaterial[]>([]);
  const scarAge = useRef<number[]>(Array.from({ length: SCARS }, () => 99));
  const scarCursor = useRef(0);
  const prevStruck = useRef(false);
  const prevGoose = useRef(false);
  const gooseX = useRef(3.2);
  const route = useRef(0);
  const damp = useRef(0);
  const freeze = useRef<boolean | null>(null);
  const shotAge = useRef(99);
  const heldX = useRef(CAM.x);
  const heldY = useRef(CAM.y);
  const heldZ = useRef(CAM.z);

  useLayoutEffect(() => {
    const plant = (
      mesh: InstancedMesh | null,
      count: number,
      place: (i: number, node: Object3D) => void,
    ) => {
      if (!mesh) {
        return;
      }
      for (let i = 0; i < count; i += 1) {
        dummy.position.set(0, 0, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        place(i, dummy);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    plant(grass.current, GRASS, (i, node) => {
      const pose = vergePose(i, "grass");
      node.position.set(pose.x, 0.28 + seeded(i + 22) * 0.1, pose.z);
      node.scale.set(
        0.22 + seeded(i + 2) * 0.28,
        0.85 + seeded(i + 8) * 1.15,
        0.22 + seeded(i + 3) * 0.22,
      );
      node.rotation.y = pose.yaw + seeded(i + 1) * Math.PI;
      node.rotation.z = (seeded(i + 15) - 0.5) * 0.16;
    });

    plant(flowers.current, FLOWERS, (i, node) => {
      const pose = vergePose(i, "flower");
      node.position.set(pose.x, 0.16, pose.z);
      const size = 0.12 + seeded(i) * 0.16;
      node.scale.set(size, size * 0.6, size);
    });

    plant(shrubs.current, SHRUBS, (i, node) => {
      const pose = vergePose(i, "shrub");
      const size = 0.62 + seeded(i + 4) * 0.7;
      node.position.set(pose.x, size * 0.38, pose.z);
      node.scale.set(size, size * 0.78, size);
      node.rotation.y = pose.yaw + seeded(i) * Math.PI;
    });

    plant(pavers.current, PAVERS, (i, node) => {
      const row = Math.floor(i / PAVER_LANES);
      const lane = (i % PAVER_LANES) - 2;
      const s = row * 1.4;
      const pose = atDistance(Math.min(ROUTE, s));
      const lateral = lane * 1.05 + (seeded(i) - 0.5) * 0.1;
      node.position.set(
        pose.x + lateral * Math.cos(pose.yaw),
        0.065,
        pose.z + lateral * Math.sin(pose.yaw),
      );
      node.scale.set(0.78 + seeded(i + 3) * 0.12, 0.085, 0.58 + seeded(i + 5) * 0.1);
      node.rotation.y = pose.yaw + (seeded(i + 7) - 0.5) * 0.08;
      node.rotation.z = (seeded(i + 11) - 0.5) * 0.02;
    });

    if (scarMat.current.length === 0) {
      for (let i = 0; i < SCARS; i += 1) {
        const material = mat.ember.clone();
        material.transparent = true;
        material.opacity = 0;
        scarMat.current[i] = material;
        const mesh = scarMesh.current[i];
        if (mesh) {
          mesh.material = material;
          mesh.visible = false;
        }
      }
    }
  }, []);

  useFrame(({ camera, clock }, dt) => {
    const view = viewRef.current;
    const land = world.current;
    const platform = deck.current;
    const foe = threat.current;
    if (!view || !land || !platform || !foe) {
      return;
    }
    if (freeze.current === null) {
      freeze.current = prefersFreeze();
    }
    const frozen = freeze.current;
    const typing = view.phase === "TYPING";
    const t = frozen ? 0 : clock.elapsedTime;
    const step = frozen ? 0 : dt;

    damp.current = typing
      ? Math.min(1, damp.current + step * 3.2)
      : Math.max(0, damp.current - step * 1.7);

    const waves = Math.max(1, view.threatCount - 1);
    let goal = (view.threatIndex / waves) * 0.78;
    if (view.runResult === "won") {
      goal = 1;
    }
    if (frozen) {
      route.current = goal;
    } else if (typing) {
      // Route and camera hold while the committed phrase is being typed.
    } else if (view.phase === "RESOLVING" && view.struck) {
      route.current += step * 0.38;
    } else if (view.phase === "AFTERMATH" && view.runResult === "won") {
      route.current += (1 - route.current) * step * 0.9;
    } else if (view.phase === "READY") {
      route.current = Math.min(goal + 0.055, route.current + step * 0.024);
    }
    route.current = Math.min(1, Math.max(0, route.current));
    land.position.z = route.current * ROUTE;

    const walking = !frozen && !typing && view.phase !== "AFTERMATH";
    const bob = walking ? Math.sin(t * 5.2) * 0.035 : 0;
    platform.position.y = 0.04 + bob;
    platform.rotation.z = walking ? Math.sin(t * 2.55) * 0.014 : 0;
    platform.rotation.x = walking ? Math.sin(t * 2.15) * 0.007 : 0;

    const gait = walking ? t * 5.25 : 0;
    for (let i = 0; i < 4; i += 1) {
      const leg = legs.current[i];
      const shin = shins.current[i];
      if (!leg) {
        continue;
      }
      const pair = i === 0 || i === 3 ? 0 : Math.PI;
      const swing = Math.sin(gait + pair) * 0.46;
      leg.rotation.x = swing;
      leg.rotation.z = (i % 2 === 0 ? -1 : 1) * 0.05;
      if (shin) {
        shin.rotation.x = Math.max(0, -swing) * 0.72 + 0.12;
      }
    }

    if (smoke.current) {
      smoke.current.visible = !frozen;
      smoke.current.position.y = 0.52 + Math.sin(t * 1.65) * 0.05;
      smoke.current.rotation.y = t * 0.35;
      smoke.current.scale.setScalar(0.94 + Math.sin(t * 1.2) * 0.06);
    }
    if (bard.current) {
      const speaking = view.bardSpeaking ? 1 : 0;
      bard.current.position.y = 1.72 + (frozen ? 0 : Math.sin(t * (2.1 + speaking)) * (0.025 + speaking * 0.035));
      bard.current.rotation.z = frozen ? 0 : Math.sin(t * 2.4) * (0.025 + speaking * 0.035);
    }
    if (grimoireGlow.current) {
      const charge = 0.085 + Math.min(1, view.typedRatio) * 0.09;
      const pulse = frozen ? 1 : 0.96 + Math.sin(t * 5) * 0.06;
      grimoireGlow.current.scale.set(charge * pulse, charge * pulse, charge * 0.65);
      const glow = grimoireGlow.current.material as MeshStandardMaterial;
      glow.emissiveIntensity = 0.75 + view.typedRatio * 1.1;
    }

    for (let i = 0; i < ARCS; i += 1) {
      const mark = arcMarks.current[i];
      if (!mark) {
        continue;
      }
      const activated = i / (ARCS - 1) <= view.typedRatio;
      const base = activated ? 0.5 : 0.4;
      const calm = typing ? 1 : 1 + Math.sin(t * 2.8 + i) * 0.05;
      mark.scale.set(base * calm, base * calm, 0.055);
      mark.rotation.z = frozen ? 0 : Math.sin(t * 0.8 + i) * 0.06;
    }

    for (let i = 0; i < SPELLS.length; i += 1) {
      const stone = stones.current[i];
      if (!stone) {
        continue;
      }
      const cooling = view.coolingIds.includes(SPELLS[i].id);
      const active = SPELLS[i].id === view.spellId && !cooling;
      stone.material = cooling ? mat.charmDim : mat[charmOf(SPELLS[i].id)];
      stone.position.y = cooling ? -0.07 : active ? 0.06 : 0;
      const s = cooling ? 0.76 : active ? 1.22 + Math.sin(t * 4.2) * 0.06 : 1;
      stone.scale.set(0.16 * s, 0.21 * s, 0.11 * s);
      stone.rotation.y = t * (active ? 0.9 : 0.25) + i;
    }

    const form = silhouetteOf(view.kind);
    if (ink.current) {
      ink.current.visible = form === "ink";
      ink.current.rotation.z = frozen ? 0 : Math.sin(t * 2.2) * 0.055;
    }
    if (golem.current) {
      golem.current.visible = form === "golem";
      golem.current.rotation.y = frozen ? 0 : Math.sin(t * 0.7) * 0.08;
    }
    if (hound.current) {
      hound.current.visible = form === "hound";
      hound.current.rotation.z = frozen ? 0 : Math.sin(t * 4.6) * 0.035;
    }
    if (swarm.current) {
      swarm.current.visible = form === "swarm";
      swarm.current.rotation.z = frozen ? 0 : Math.sin(t * 1.8) * 0.08;
    }
    if (wyrm.current) {
      wyrm.current.visible = form === "wyrm";
      wyrm.current.rotation.y = frozen ? 0 : Math.sin(t * 1.2) * 0.16;
    }

    const tti = frozen ? 0.78 : view.ttiRatio;
    const far = -11.6;
    const near = -2.65;
    let tz = near + (far - near) * tti;
    let ty = form === "golem" ? 1.0 : form === "wyrm" ? 0.62 : 0.72;
    let sx = 1;
    let sy = 1;
    let sz = 1;
    if (view.struck) {
      ty = 0.18;
      sy = 0.18;
      sx = 1.24;
      sz = 1.24;
    } else if (view.landed) {
      tz = -2.0;
      sx = 1.2;
      sy = 1.12;
      sz = 1.2;
    }
    foe.position.set(0.32, ty + (frozen ? 0 : Math.sin(t * 2.4) * 0.025), tz);
    foe.scale.set(sx, sy, sz);

    if (view.struck && !prevStruck.current) {
      shotAge.current = 0;
      const slot = scarCursor.current % SCARS;
      const scar = scarMesh.current[slot];
      const material = scarMat.current[slot];
      const key = familyOf(view.spellId);
      const root = rootOf(view.spellId);
      vfxRoot.current = root;
      const source = mat[key] as MeshStandardMaterial;
      if (scar && material) {
        material.color.copy(root === "fire" ? mat.scorch.color : source.color);
        material.emissive.copy(root === "fire" ? mat.scorch.emissive : source.emissive);
        material.opacity = root === "earth" ? 0 : 0.92;
        scar.position.set(foe.position.x, 0.07, foe.position.z - land.position.z);
        scar.rotation.y = seeded(slot + view.threatIndex * 4) * Math.PI;
        scar.scale.set(root === "fire" ? 3.0 : root === "wind" ? 2.4 : 2.05, 1, root === "fire" ? 3.0 : 1.62);
        scar.visible = root === "fire" || root === "wind";
        scarAge.current[slot] = 0;
        scarCursor.current = slot + 1;
        [
          scarCrystal.current[slot],
          scarEmber.current[slot],
          scarWind.current[slot],
          scarEarth.current[slot],
        ].forEach((detail) => {
          if (detail) {
            detail.position.copy(scar.position);
            detail.rotation.y = scar.rotation.y;
            detail.scale.set(1, frozen ? 1 : 0.04, 1);
          }
        });
        if (scarCrystal.current[slot]) {
          scarCrystal.current[slot]!.visible = root === "ice";
        }
        if (scarEmber.current[slot]) {
          scarEmber.current[slot]!.visible = root === "fire";
        }
        if (scarWind.current[slot]) {
          scarWind.current[slot]!.visible = root === "wind";
        }
        if (scarEarth.current[slot]) {
          scarEarth.current[slot]!.visible = root === "earth";
        }
      }
      if (projectileCore.current) {
        projectileCore.current.material =
          root === "fire" ? mat.fireArc : root === "ice" ? mat.ice : root === "wind" ? mat.windTeal : mat.earthGlow;
      }
    }
    prevStruck.current = view.struck;

    shotAge.current += frozen ? 1 : step;
    if (projectile.current && impact.current) {
      const p = Math.min(1, shotAge.current / 0.5);
      const active = shotAge.current < 0.88;
      const root = vfxRoot.current;
      projectile.current.visible = active && p < 0.94;
      impact.current.visible = active && p > 0.66;
      if (vfxFire.current) {
        vfxFire.current.visible = root === "fire";
      }
      if (vfxIce.current) {
        vfxIce.current.visible = root === "ice";
      }
      if (vfxWind.current) {
        vfxWind.current.visible = root === "wind";
      }
      if (vfxEarth.current) {
        vfxEarth.current.visible = root === "earth";
      }
      if (active) {
        const startX = CAST_FX.startX;
        const startY = CAST_FX.startY;
        const startZ = CAST_FX.startZ;
        const arc = root === "ice" ? 0.28 : 0.72;
        projectile.current.position.set(
          startX + (foe.position.x - startX) * p,
          Math.min(2.35, startY + (foe.position.y + 0.15 - startY) * p + Math.sin(p * Math.PI) * arc),
          Math.min(CAST_FX.lecternLipZ - 0.08, startZ + (foe.position.z - startZ) * p),
        );
        projectile.current.rotation.x = root === "wind" ? t * 7 : t * 2.2;
        projectile.current.rotation.z = root === "fire" ? t * 3.4 : t * 1.4;
        const projectileScale = root === "fire" ? 1.15 + Math.sin(p * Math.PI) * 0.35 : 0.86 + Math.sin(p * Math.PI) * 0.28;
        projectile.current.scale.setScalar(projectileScale);
        if (vfxIce.current) {
          vfxIce.current.scale.set(0.45 + p * 1.8, 0.55, 0.7);
        }
        if (vfxEarth.current) {
          vfxEarth.current.scale.set(1, 0.2 + p * 0.9, 1);
        }
        impact.current.position.copy(foe.position);
        impact.current.position.y = Math.min(2.1, foe.position.y + 0.12);
        const hitScale = Math.max(0.01, Math.sin(((p - 0.66) / 0.34) * Math.PI)) * (root === "fire" ? 2.1 : 1.6);
        impact.current.scale.setScalar(hitScale);
        impact.current.rotation.y = t * 2.8;
      }
    }

    for (let i = 0; i < SCARS; i += 1) {
      const scar = scarMesh.current[i];
      const material = scarMat.current[i];
      if (!scar || !material || !scar.visible) {
        continue;
      }
      scarAge.current[i] += step;
      const life = scarAge.current[i];
      const grow = frozen ? 1 : Math.min(1, life / 0.42);
      material.opacity = Math.max(0, 0.9 - life / 13);
      if (scarCrystal.current[i]?.visible) {
        scarCrystal.current[i]!.scale.set(1, grow, 1);
      }
      if (scarEarth.current[i]?.visible) {
        scarEarth.current[i]!.scale.set(1, grow, 1);
      }
      if (scarWind.current[i]?.visible) {
        scarWind.current[i]!.rotation.y = scar.rotation.y + Math.sin(t * 3.2 + i) * 0.18;
      }
      if (life > 13.5) {
        scar.visible = false;
        scarCrystal.current[i]!.visible = false;
        scarEmber.current[i]!.visible = false;
        scarWind.current[i]!.visible = false;
        scarEarth.current[i]!.visible = false;
      }
    }

    if (goose.current) {
      if (view.goose) {
        if (!prevGoose.current) {
          gooseX.current = 3.2;
        }
        gooseX.current += (1.25 - gooseX.current) * (frozen ? 1 : step * 3.5);
        goose.current.visible = true;
        goose.current.position.set(
          gooseX.current,
          0.72 + (frozen ? 0 : Math.abs(Math.sin(t * 7.2)) * 0.07),
          -2.28,
        );
        goose.current.rotation.y = -0.76;
        goose.current.rotation.z = frozen ? 0 : Math.sin(t * 7.2) * 0.04;
      } else {
        goose.current.visible = false;
        gooseX.current = 3.2;
      }
    }
    prevGoose.current = view.goose;

    const sway =
      frozen || damp.current > 0.85
        ? 0
        : Math.sin(t * 0.31) * 0.09 * (1 - damp.current);
    const camX = CAM.x + sway;
    const camY = CAM.y;
    const camZ = CAM.z;
    if (typing && damp.current > 0.2) {
      camera.position.set(heldX.current, heldY.current, heldZ.current);
    } else {
      heldX.current = camX;
      heldY.current = camY;
      heldZ.current = camZ;
      camera.position.set(camX, camY, camZ);
    }
    camera.lookAt(LOOK.x, LOOK.y, LOOK.z);
  });

  return (
    <>
      <DetailTextures />
      <mesh geometry={geo.sky} material={mat.sky} scale={115} />
      <fog attach="fog" args={["#d99b60", 28, 118]} />
      <hemisphereLight args={["#ffdca0", "#1d3d3b", 1.22]} />
      <directionalLight position={[14, 13, 8]} intensity={2.6} color="#ffd090" />
      <directionalLight position={[-9, 6, -12]} intensity={0.72} color="#73a8cc" />
      <pointLight position={[-1.1, 2.2, -1.5]} intensity={1.8} color="#5be1f2" distance={9} />
      <pointLight position={[0.4, 1.4, -7]} intensity={1.25} color="#b95cff" distance={11} />
      <pointLight position={[-1.3, 1.25, 0.2]} intensity={1.4} color="#ffbf66" distance={6} />

      <mesh geometry={geo.sphere} material={mat.sun} position={[-28, 22, -64]} scale={5.6} />
      {[
        [-18, 17, -58, 7.5, 1.0],
        [-10, 18, -61, 5.4, 0.72],
        [15, 15, -64, 8.4, 0.9],
        [24, 14.5, -68, 5.6, 0.65],
      ].map(([x, y, z, sx, sy], i) => (
        <mesh
          key={`cloud-${i}`}
          geometry={geo.dodeca}
          material={mat.cloud}
          position={[x, y, z]}
          scale={[sx, sy, 1.2]}
          rotation={[0, i * 0.4, i % 2 ? 0.08 : -0.06]}
        />
      ))}

      <group ref={world} name="route">
        <mesh geometry={geo.box} material={mat.meadowDeep} position={[0, -0.52, -ROUTE / 2]} scale={[56, 0.8, ROUTE + 36]} />
        <TerrainShelf position={[-16, 0.05, -12]} scale={[9.5, 0.65, 12]} />
        <TerrainShelf position={[17, 0.2, -28]} scale={[10, 0.85, 14]} deep />
        <TerrainShelf position={[-17, 0.55, -52]} scale={[10.5, 1.2, 16]} deep />
        <TerrainShelf position={[18, 0.85, -86]} scale={[11, 1.65, 16]} />
        <TerrainShelf position={[-16, 1.1, -118]} scale={[10, 2.0, 14]} />
        {[
          [-25, 3.4, -148, 8, 7],
          [-17, 2.8, -152, 7, 5.8],
          [-10, 3.8, -156, 8.5, 7.8],
          [12, 3.2, -158, 7.5, 6.4],
          [21, 4.1, -154, 9, 8.2],
        ].map(([x, y, z, sx, sy], i) => (
          <mesh
            key={`ridge-${i}`}
            geometry={geo.cone}
            material={i % 2 ? mat.mountain : mat.archive}
            position={[x, y, z]}
            scale={[sx, sy, 4.8]}
            rotation={[0, i * 0.22, 0]}
          />
        ))}

        <mesh name="road-ribbon-edge" geometry={geo.roadEdge} material={mat.roadEdge} />
        <mesh name="road-ribbon" geometry={geo.road} material={mat.path} />
        <instancedMesh name="verge-grass" ref={grass} args={[geo.cone, mat.tuft, GRASS]} />
        <instancedMesh name="verge-flowers" ref={flowers} args={[geo.dodeca, mat.flower, FLOWERS]} />
        <instancedMesh name="verge-shrubs" ref={shrubs} args={[geo.dodeca, mat.tuftAmber, SHRUBS]} />
        <instancedMesh ref={pavers} args={[geo.box, mat.paver, PAVERS]} />

        <DeparturePad
          position={[BAKED_PLACEMENTS.departure.x, 0, BAKED_PLACEMENTS.departure.z]}
          rotation={[0, BAKED_PLACEMENTS.departure.yaw, 0]}
        />
        <WordlockShrine
          position={[BAKED_PLACEMENTS.shrine.x, 0.05, BAKED_PLACEMENTS.shrine.z]}
          rotation={[0, BAKED_PLACEMENTS.shrine.yaw + 0.35, 0]}
        />
        <group
          position={[BAKED_PLACEMENTS.ramp.x, 0.05, BAKED_PLACEMENTS.ramp.z]}
          rotation={[0, BAKED_PLACEMENTS.ramp.yaw, 0]}
        >
          <TerraceRamp />
        </group>

        {WORLD_SPEC.segments.map((id) => {
          const mid = atDistance(segmentMid(id));
          return (
            <group
              key={id}
              name={`segment-${id}`}
              position={[mid.x, 0, mid.z]}
              rotation={[0, mid.yaw, 0]}
            >
              {id === "opening-straight" || id === "archive-approach" ? <RouteStraight /> : null}
              {id === "encounter-clearing-a" || id === "central-clearing" ? <ClearingGround /> : null}
              {id === "river-bend" ? (
                <>
                  <RouteBend />
                  <InkRiver />
                </>
              ) : null}
              {id === "bridge" ? <RouteBridge /> : null}
              {id === "opening-straight" || id === "encounter-clearing-a" || id === "archive-approach" ? (
                <>
                  <RouteEdge side={-1} />
                  <RouteEdge side={1} />
                </>
              ) : null}
            </group>
          );
        })}

        {WORLD_SPEC.sceneryRouteT.slice(0, 3).map((t) => {
          const pose = offsetPoint(t * ROUTE, WORLD_SPEC.halfWidth_m + 4.8);
          return (
            <mesh
              key={`scenery-${t}`}
              name={`scenery-t-${t}`}
              geometry={geo.disc}
              material={mat.lamp}
              position={[pose.x, 0.04, pose.z]}
              scale={[2.4, 1, 2.4]}
            />
          );
        })}

        <IcePatch />
        {(["A", "I", "F", "X"] as const).map((kind, i) => {
          const pose = BAKED_PLACEMENTS.monoliths[i];
          return (
            <Monolith
              key={kind}
              kind={kind}
              position={[pose.x, 0.1, pose.z]}
              rotation={[0, pose.yaw + (i % 2 ? -0.4 : 0.4), 0]}
            />
          );
        })}

        {[12, 36, 60, 84, 108, 132].map((s, i) => {
          const pose = offsetPoint(s, (i % 2 ? 1 : -1) * (WORLD_SPEC.halfWidth_m + 0.45));
          return (
            <RoadLantern
              key={`lantern-${s}`}
              position={[pose.x, 0.05, pose.z]}
              rotation={[0, pose.yaw + (i % 2 ? -0.1 : 0.1), 0]}
            />
          );
        })}

        {[18, 54, 90, 126].map((s, i) => {
          const pose = offsetPoint(s, (i % 2 ? 1 : -1) * (WORLD_SPEC.cameraSafe_m / 2 + 2.2));
          return <RuinArch key={`ruin-${s}`} position={[pose.x, 0.2, pose.z]} rotation={pose.yaw + 0.2} scale={1 + i * 0.12} />;
        })}

        {[16, 28, 40, 52, 64, 76, 88, 100, 112, 124, 136].map((s, i) => {
          const pose = offsetPoint(s, (i % 2 ? 1 : -1) * (WORLD_SPEC.cameraSafe_m / 2 + 1.8 + (i % 3) * 1.1));
          return <Tree key={`tree-${s}`} position={[pose.x, 0.05, pose.z]} scale={1.15 + (i % 4) * 0.18} teal={i % 2 === 0} />;
        })}

        <FloatingIsle position={[-12.5, 9.8, -28]} scale={0.92} />
        <FloatingIsle position={[13.2, 11.5, -64]} scale={1.16} />
        <FloatingIsle position={[-10.6, 13.2, -108]} scale={0.78} />

        {Array.from({ length: SCARS }, (_, i) => (
          <group key={`memory-${i}`}>
            <mesh
              ref={(node) => {
                scarMesh.current[i] = node;
              }}
              geometry={geo.disc}
              position={[0, 0.05, 0]}
              visible={false}
            />
            <group
              name="memory-ice-ridge"
              ref={(node) => {
                scarCrystal.current[i] = node;
              }}
              visible={false}
            >
              {[-1.8, -0.6, 0.6, 1.8].map((x, j) => (
                <mesh
                  key={`scar-ice-${j}`}
                  geometry={geo.octa}
                  material={mat.ice}
                  position={[x, 1.05, (j - 1.5) * 0.12]}
                  scale={[0.42, 2.3 - Math.abs(j - 1.5) * 0.28, 0.28]}
                  rotation={[0.08, j * 0.35, 0.1]}
                />
              ))}
            </group>
            <group
              name="memory-scorch"
              ref={(node) => {
                scarEmber.current[i] = node;
              }}
              visible={false}
            >
              <mesh geometry={geo.disc} material={mat.scorch} position={[0, 0.02, 0]} scale={[3, 1, 3]} />
              {[-0.7, -0.15, 0.35, 0.8].map((x, j) => (
                <mesh
                  key={`scar-ember-${j}`}
                  geometry={geo.tetra}
                  material={mat.spark}
                  position={[x, 0.12 + (j % 2) * 0.08, (j - 1.5) * 0.2]}
                  scale={0.1 + j * 0.012}
                />
              ))}
            </group>
            <group
              name="memory-wind-grass"
              ref={(node) => {
                scarWind.current[i] = node;
              }}
              visible={false}
            >
              {[-0.7, -0.2, 0.25, 0.7].map((x, j) => (
                <mesh
                  key={`scar-wind-${j}`}
                  geometry={geo.cone}
                  material={j % 2 ? mat.tuftTeal : mat.wind}
                  position={[x, 0.42, (j - 1.5) * 0.16]}
                  scale={[0.16, 0.9, 0.16]}
                  rotation={[0.35, j * 0.4, 0.18]}
                />
              ))}
            </group>
            <group
              name="memory-earth-barrier"
              ref={(node) => {
                scarEarth.current[i] = node;
              }}
              visible={false}
            >
              {[
                [-1.7, -0.35],
                [-0.55, 0.2],
                [0.55, -0.15],
                [1.7, 0.3],
              ].map(([x, z], j) => (
                <mesh
                  key={`scar-earth-${j}`}
                  geometry={geo.box}
                  material={j % 2 ? mat.slab : mat.stone}
                  position={[x, 1.0, z]}
                  scale={[1.15, 2.0, 1.2]}
                  rotation={[0, j * 0.08, 0]}
                />
              ))}
            </group>
          </group>
        ))}

        <group
          position={[BAKED_PLACEMENTS.archive.x, 0.2, BAKED_PLACEMENTS.archive.z]}
          rotation={[0, BAKED_PLACEMENTS.archive.yaw, 0]}
        >
          <ArchiveLandmark />
        </group>
      </group>

      <WalkingScriptorium
        deckRef={deck}
        legsRef={legs}
        shinsRef={shins}
        smokeRef={smoke}
        stonesRef={stones}
        bardRef={bard}
        grimoireGlowRef={grimoireGlow}
      />
      <RuneArc marksRef={arcMarks} />

      <group ref={threat} name="threat" position={[0.32, 0.72, -9]}>
        <mesh geometry={geo.disc} material={mat.shade} position={[0, -0.62, 0]} scale={[2.4, 1, 2.1]} />
        <group ref={ink}>
          <InkSprite />
        </group>
        <group ref={golem} visible={false} position={[0, -0.2, 0]} scale={0.78}>
          <RunicGolem />
        </group>
        <group ref={hound} visible={false} position={[0, 0.05, 0]} scale={1.12}>
          <ParchmentHound />
        </group>
        <group ref={swarm} visible={false} position={[0, -0.2, 0]}>
          <InkSwarm />
        </group>
        <group ref={wyrm} visible={false} position={[0, -0.05, 0]} scale={0.88}>
          <ScrollWyrm />
        </group>
      </group>

      <group ref={projectile} name="spell-projectile" visible={false}>
        <mesh ref={projectileCore} geometry={geo.icosa} material={mat.ember} scale={0.28} />
        <group ref={vfxFire} name="vfx-fire">
          <mesh
            geometry={geo.torus}
            material={mat.fireArc}
            scale={[ROOT_VFX.fire.span * 0.72, ROOT_VFX.fire.height * 2, 0.5]}
            rotation={[0.4, 0, Math.PI / 2]}
          />
          <mesh geometry={geo.sphere} material={mat.spark} scale={0.34} />
          {[-0.7, 0.7].map((side) => (
            <mesh key={`fire-spark-${side}`} geometry={geo.tetra} material={mat.spark} position={[side * 0.85, 0.1, 0]} scale={0.12} />
          ))}
        </group>
        <group ref={vfxIce} name="vfx-ice">
          <mesh geometry={geo.box} material={mat.ice} scale={[ROOT_VFX.ice.span, 0.08, 0.7]} />
          {[-0.7, 0.05, 0.72].map((x, i) => (
            <mesh
              key={`ice-shard-${i}`}
              geometry={geo.octa}
              material={mat.ice}
              position={[x, ROOT_VFX.ice.height * (0.35 + i * 0.12), 0.18]}
              scale={[0.16, ROOT_VFX.ice.height, 0.16]}
              rotation={[0.2, i, 0.15]}
            />
          ))}
        </group>
        <group ref={vfxWind} name="vfx-wind">
          <mesh
            geometry={geo.torus}
            material={mat.windTeal}
            scale={[ROOT_VFX.wind.span * 0.62, ROOT_VFX.wind.height * 1.4, 0.7]}
            rotation={[0.9, 0, 0]}
          />
          <mesh
            geometry={geo.torus}
            material={mat.windTeal}
            scale={[ROOT_VFX.wind.span * 0.42, ROOT_VFX.wind.height, 0.85]}
            rotation={[-0.7, Math.PI / 2, 0]}
          />
        </group>
        <group ref={vfxEarth} name="vfx-earth">
          {[-0.42, 0.04, 0.46].map((x, i) => (
            <mesh
              key={`earth-block-${i}`}
              geometry={geo.box}
              material={mat.stone}
              position={[x, ROOT_VFX.earth.height * (0.4 + i * 0.18), 0]}
              scale={[0.3, ROOT_VFX.earth.height + i * 0.1, 0.26]}
            />
          ))}
          <mesh
            geometry={geo.disc}
            material={mat.earthGlow}
            position={[0, -0.12, 0]}
            scale={[ROOT_VFX.earth.span * 0.8, 1, 0.42]}
            rotation={[0.15, 0, 0]}
          />
        </group>
      </group>
      <group ref={impact} name="spell-impact" visible={false}>
        <mesh geometry={geo.torus} material={mat.fireArc} scale={[1.15, 1.15, 0.7]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={geo.disc} material={mat.earthGlow} scale={[0.9, 1, 0.25]} />
        {Array.from({ length: 4 }, (_, i) => (
          <mesh
            key={`impact-shard-${i}`}
            geometry={geo.tetra}
            material={i % 2 ? mat.spark : mat.ice}
            position={[Math.cos((i * Math.PI) / 2) * 0.7, 0.12, Math.sin((i * Math.PI) / 2) * 0.7]}
            scale={[0.1, 0.26, 0.1]}
            rotation={[i, i * 0.6, 0]}
          />
        ))}
      </group>

      <group ref={goose} name="honk-root" position={[3.2, 0.72, -2.28]} visible={false} scale={1.3}>
        <Honk />
      </group>
    </>
  );
}
