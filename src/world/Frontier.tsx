import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  type Group,
} from "three";
import { SPELLS } from "../game/content";
import {
  ArchiveLandmark,
  FloatingIsle,
  Honk,
  IcePatch,
  InkSprite,
  InkSwarm,
  Monolith,
  ParchmentHound,
  RoadLantern,
  RuneArc,
  RunicGolem,
  ScrollWyrm,
  WalkingScriptorium,
} from "./cast";
import { charmOf, familyOf, geo, mat, seeded, silhouetteOf } from "./kit";
import { DetailTextures } from "./tex";
import type { WorldView } from "./view";

const ROUTE = 52;
const GRASS = 96;
const FLOWERS = 64;
const PAVERS = 72;
const SCARS = 8;
const ARCS = 7;
const WIN_ROUTE = 0.9;
const dummy = new Object3D();

const CAM = { x: 5.35, y: 4.55, z: 7.15 };
const LOOK = { x: 0.12, y: 0.72, z: -3.9 };

function prefersFreeze(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Frontier({
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
  const grass = useRef<InstancedMesh>(null);
  const flowers = useRef<InstancedMesh>(null);
  const pavers = useRef<InstancedMesh>(null);
  const legs = useRef<(Group | null)[]>([]);
  const shins = useRef<(Group | null)[]>([]);
  const stones = useRef<(Mesh | null)[]>([]);
  const arcMarks = useRef<(Mesh | null)[]>([]);
  const scarMesh = useRef<(Mesh | null)[]>([]);
  const scarMat = useRef<MeshStandardMaterial[]>([]);
  const scarAge = useRef<number[]>(Array.from({ length: SCARS }, () => 99));
  const scarCursor = useRef(0);
  const prevStruck = useRef(false);
  const prevGoose = useRef(false);
  const gooseX = useRef(2.35);
  const route = useRef(0);
  const damp = useRef(0);
  const freeze = useRef<boolean | null>(null);
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
      const side = i % 2 === 0 ? -1 : 1;
      node.position.set(
        side * (2.15 + seeded(i) * 11.5),
        0.22,
        -seeded(i + 4) * ROUTE - 1.4,
      );
      node.scale.set(0.18 + seeded(i + 2) * 0.16, 0.38 + seeded(i + 8) * 0.5, 0.18);
      node.rotation.y = seeded(i + 1) * 6;
    });

    plant(flowers.current, FLOWERS, (i, node) => {
      const side = seeded(i + 3) > 0.5 ? 1 : -1;
      node.position.set(
        side * (2.3 + seeded(i + 6) * 8.5),
        0.12,
        -2 - seeded(i + 9) * (ROUTE - 6),
      );
      node.scale.set(0.1 + seeded(i) * 0.08, 0.08, 0.1 + seeded(i + 2) * 0.08);
    });

    plant(pavers.current, PAVERS, (i, node) => {
      const lane = (i % 3) - 1;
      node.position.set(
        lane * 0.85 + (seeded(i) - 0.5) * 0.18,
        0.04,
        -i * 0.72 - 0.4,
      );
      node.scale.set(0.78, 0.08, 0.58);
      node.rotation.y = (seeded(i + 5) - 0.5) * 0.2;
    });

    if (scarMat.current.length === 0) {
      for (let i = 0; i < SCARS; i += 1) {
        const clone = mat.ember.clone();
        clone.transparent = true;
        clone.opacity = 0;
        scarMat.current[i] = clone;
        const mesh = scarMesh.current[i];
        if (mesh) {
          mesh.material = clone;
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

    if (typing) {
      damp.current = Math.min(1, damp.current + step * 3.2);
    } else {
      damp.current = Math.max(0, damp.current - step * 1.8);
    }

    const waves = Math.max(1, view.threatCount - 1);
    let goal = (view.threatIndex / waves) * 0.8;
    if (view.runResult === "won") {
      goal = WIN_ROUTE;
    }
    if (frozen) {
      route.current = goal;
    } else if (view.phase === "TYPING") {
      // Camera and route hold so the phrase stays optically still.
    } else if (view.phase === "RESOLVING" && view.struck) {
      route.current += step * 0.32;
    } else if (view.phase === "AFTERMATH" && view.runResult === "won") {
      route.current += (WIN_ROUTE - route.current) * step * 0.85;
    } else if (view.phase === "READY") {
      route.current += step * 0.02;
      route.current = Math.min(route.current, goal + 0.05);
    }
    route.current = Math.min(1, Math.max(0, route.current));
    land.position.z = route.current * ROUTE;

    const walking = !frozen && !typing && view.phase !== "AFTERMATH";
    const bob = walking ? Math.sin(t * 5.1) * 0.025 : 0;
    platform.position.y = bob;
    platform.rotation.z = walking ? Math.sin(t * 2.4) * 0.012 : 0;

    const gait = walking ? t * 5.2 : 0;
    for (let i = 0; i < 4; i += 1) {
      const leg = legs.current[i];
      const shin = shins.current[i];
      if (!leg) {
        continue;
      }
      const pair = i === 0 || i === 3 ? 0 : Math.PI;
      const swing = Math.sin(gait + pair) * 0.42;
      leg.rotation.x = swing;
      if (shin) {
        shin.rotation.x = Math.max(0, -swing) * 0.65 + 0.12;
      }
    }

    if (smoke.current) {
      smoke.current.visible = !frozen;
      smoke.current.position.y = 2.48 + (frozen ? 0 : Math.sin(t * 1.6) * 0.04);
      smoke.current.rotation.y = t * 0.4;
    }

    const lockMix = view.locked ? 0.4 : 0.22 + Math.sin(t * 2.1) * 0.08;
    for (let i = 0; i < ARCS; i += 1) {
      const mark = arcMarks.current[i];
      if (!mark) {
        continue;
      }
      const pulse = typing ? 0.92 : 0.82 + lockMix * 0.25;
      mark.scale.setScalar(0.42 * pulse);
      const glow = mark.material as MeshStandardMaterial;
      glow.emissiveIntensity = view.locked ? 0.55 : 0.85 + Math.sin(t * 3 + i) * 0.12;
    }

    for (let i = 0; i < SPELLS.length; i += 1) {
      const stone = stones.current[i];
      if (!stone) {
        continue;
      }
      const cooling = view.coolingIds.includes(SPELLS[i].id);
      const active = SPELLS[i].id === view.spellId && !cooling;
      stone.material = cooling ? mat.charmDim : mat[charmOf(SPELLS[i].id)];
      const lift = cooling ? 1.88 : active ? 2.1 : 1.98;
      stone.position.y = lift;
      stone.scale.set(
        cooling ? 0.1 : active ? 0.18 : 0.16,
        cooling ? 0.12 : active ? 0.24 : 0.2,
        cooling ? 0.07 : active ? 0.12 : 0.1,
      );
    }

    const form = silhouetteOf(view.kind);
    if (ink.current) {
      ink.current.visible = form === "ink";
    }
    if (golem.current) {
      golem.current.visible = form === "golem";
    }
    if (hound.current) {
      hound.current.visible = form === "hound";
    }
    if (swarm.current) {
      swarm.current.visible = form === "swarm";
    }
    if (wyrm.current) {
      wyrm.current.visible = form === "wyrm";
    }

    const tti = frozen ? 1 : view.ttiRatio;
    const far = -10.2;
    const near = -2.35;
    let tz = near + (far - near) * tti;
    let ty = form === "golem" ? 0.85 : form === "wyrm" ? 0.55 : 0.52;
    let sx = 1;
    let sy = 1;
    let sz = 1;
    if (view.struck) {
      ty = 0.16;
      sy = 0.22;
      sx = 1.18;
      sz = 1.18;
    } else if (view.landed) {
      tz = -1.7;
      sx = 1.16;
      sy = 1.1;
      sz = 1.16;
    } else if (view.goose) {
      tz += 0.35;
    }
    foe.position.set(view.goose ? -0.7 : 0, ty, tz);
    foe.scale.set(sx, sy, sz);

    if (view.struck && !prevStruck.current) {
      const slot = scarCursor.current % SCARS;
      const scar = scarMesh.current[slot];
      const material = scarMat.current[slot];
      if (scar && material) {
        const key = familyOf(view.spellId);
        material.color.copy(mat[key].color);
        material.emissive.copy(mat[key].emissive);
        material.opacity = 0.94;
        scar.position.set(foe.position.x, 0.06, foe.position.z - land.position.z);
        if (key === "wind") {
          scar.scale.set(3.2, 1, 0.48);
        } else if (key === "frost") {
          scar.scale.set(1.7, 1.4, 1.7);
        } else {
          scar.scale.set(1.85, 1, 1.55);
        }
        scar.visible = true;
        scarAge.current[slot] = 0;
        scarCursor.current = slot + 1;
      }
    }
    prevStruck.current = view.struck;

    for (let i = 0; i < SCARS; i += 1) {
      const scar = scarMesh.current[i];
      const material = scarMat.current[i];
      if (!scar || !material || !scar.visible) {
        continue;
      }
      scarAge.current[i] += step;
      const life = scarAge.current[i];
      material.opacity = Math.max(0, 0.88 - life / 11);
      if (life > 12) {
        scar.visible = false;
      }
    }

    if (goose.current) {
      if (view.goose) {
        if (!prevGoose.current) {
          gooseX.current = 2.35;
        }
        gooseX.current += (1.15 - gooseX.current) * (frozen ? 1 : step * 3.6);
        goose.current.visible = true;
        goose.current.position.set(
          gooseX.current,
          0.52 + (frozen ? 0 : Math.sin(t * 8) * 0.04),
          -2.15,
        );
        goose.current.rotation.y = -0.75;
      } else {
        goose.current.visible = false;
        gooseX.current = 2.35;
      }
    }
    prevGoose.current = view.goose;

    const sway =
      frozen || damp.current > 0.85 ? 0 : Math.sin(t * 0.32) * 0.1 * (1 - damp.current);
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
      <color attach="background" args={["#f0c56a"]} />
      <fog attach="fog" args={["#e8b868", 26, 88]} />
      <hemisphereLight args={["#f4d8a0", "#2a3a20", 0.95]} />
      <directionalLight position={[14, 8, 6]} intensity={2.15} color="#ffc878" />
      <directionalLight position={[-8, 4, -6]} intensity={0.42} color="#88a8c8" />
      <pointLight position={[0.2, 2.4, -2.1]} intensity={1.35} color="#6ad8ff" distance={9} />
      <pointLight position={[0.2, 1.6, -8]} intensity={0.85} color="#c84cff" distance={10} />
      <pointLight position={[1.4, 0.55, 0.8]} intensity={1.1} color="#ffd090" distance={5} />

      <group ref={world} name="route">
        <mesh
          geometry={geo.box}
          material={mat.meadow}
          position={[0, -0.22, -ROUTE / 2]}
          scale={[42, 0.4, ROUTE + 20]}
        />
        <mesh
          geometry={geo.box}
          material={mat.meadowDeep}
          position={[14, -0.18, -ROUTE / 2]}
          scale={[12, 0.5, ROUTE + 16]}
        />
        <mesh
          geometry={geo.box}
          material={mat.path}
          position={[0, 0.01, -ROUTE / 2]}
          scale={[3.15, 0.07, ROUTE + 8]}
        />
        <instancedMesh ref={grass} args={[geo.cone, mat.tuft, GRASS]} />
        <instancedMesh ref={flowers} args={[geo.sphere, mat.flower, FLOWERS]} />
        <instancedMesh ref={pavers} args={[geo.box, mat.paver, PAVERS]} />
        <IcePatch />
        <Monolith kind="A" position={[-3.7, 0, -11.2]} />
        <Monolith kind="I" position={[3.55, 0, -17.6]} />
        <Monolith kind="F" position={[-4.1, 0, -27.4]} />
        <Monolith kind="X" position={[3.8, 0, -36.2]} />
        {Array.from({ length: 8 }, (_, i) => {
          const z = -3.5 - i * 6.2;
          const x = i % 2 === 0 ? -2.35 : 2.35;
          return <RoadLantern key={`lamp-${i}`} position={[x, 0, z]} />;
        })}
        {[
          [-4.6, -5.2],
          [4.8, -8.4],
          [-5.4, -14.5],
          [5.1, -21],
          [-4.9, -30],
          [5.4, -39],
        ].map(([x, z], i) => (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            <mesh
              geometry={geo.cyl}
              material={mat.woodDark}
              position={[0, 0.45, 0]}
              scale={[0.12, 0.9, 0.12]}
            />
            <mesh
              geometry={geo.cone}
              material={i % 2 === 0 ? mat.tuft : mat.tuftDark}
              position={[0, 1.35, 0]}
              scale={[0.7, 1.5, 0.7]}
            />
          </group>
        ))}
        <FloatingIsle position={[-7.5, 8.4, -14]} scale={0.85} />
        <FloatingIsle position={[8.2, 9.6, -22]} scale={1.05} />
        <FloatingIsle position={[-5.2, 11.2, -32]} scale={0.7} />
        <mesh
          geometry={geo.box}
          material={mat.navy}
          position={[0.4, 9.1, -18]}
          scale={[12.5, 0.04, 0.06]}
          rotation={[0, 0.15, -0.08]}
        />
        {Array.from({ length: SCARS }, (_, i) => (
          <mesh
            key={`scar-${i}`}
            ref={(node) => {
              scarMesh.current[i] = node;
            }}
            geometry={geo.disc}
            position={[0, 0.05, 0]}
            visible={false}
          />
        ))}
        <group position={[0, 0, -ROUTE - 12]}>
          <ArchiveLandmark />
        </group>
      </group>

      <WalkingScriptorium
        deckRef={deck}
        legsRef={legs}
        shinsRef={shins}
        smokeRef={smoke}
        stonesRef={stones}
      />
      <RuneArc marksRef={arcMarks} />

      <group ref={threat} name="threat" position={[0, 0.55, -8]}>
        <mesh geometry={geo.disc} material={mat.shade} position={[0, -0.48, 0]} scale={[2.2, 1, 2.2]} />
        <group ref={ink}>
          <InkSprite />
        </group>
        <group ref={golem} visible={false} position={[0, 0.15, 0]} scale={0.85}>
          <RunicGolem />
        </group>
        <group ref={hound} visible={false} position={[0, 0.25, 0]} scale={1.15}>
          <ParchmentHound />
        </group>
        <group ref={swarm} visible={false}>
          <InkSwarm />
        </group>
        <group ref={wyrm} visible={false} position={[0, 0.05, 0]} scale={0.9}>
          <ScrollWyrm />
        </group>
      </group>

      <group ref={goose} name="honk-root" position={[2.35, 0.52, -2.15]} visible={false} scale={1.45}>
        <Honk />
      </group>
    </>
  );
}
