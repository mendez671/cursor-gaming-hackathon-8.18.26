import { useEffect, useState, type Ref, type RefObject } from "react";
import { Box3, Vector3, type Group, type Material, type Mesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { SPELLS } from "../game/content";
import { charmOf, geo, mat } from "./kit";
import { MODULE_DECK, PILOT_COSTUMES, WAGON, type PilotCostumeId } from "./spec";

const gltfLoader = new GLTFLoader();

function usePilotCostume(id: PilotCostumeId): Group | null {
  const [root, setRoot] = useState<Group | null>(null);
  useEffect(() => {
    let dead = false;
    const spec = PILOT_COSTUMES[id];
    gltfLoader.load(
      spec.url,
      (gltf) => {
        if (dead) {
          return;
        }
        const scene = gltf.scene;
        const size = new Vector3();
        new Box3().setFromObject(scene).getSize(size);
        const height = size.y > 0.01 ? size.y : 2;
        scene.scale.setScalar(spec.targetHeight_m / height);
        scene.updateMatrixWorld(true);
        const fitted = new Box3().setFromObject(scene);
        scene.position.x -= (fitted.min.x + fitted.max.x) * 0.5;
        scene.position.z -= (fitted.min.z + fitted.max.z) * 0.5;
        scene.position.y -= fitted.min.y;
        scene.position.y += spec.footY;
        scene.rotation.y = spec.yaw;
        scene.name = `costume-${spec.id}`;
        scene.traverse((obj) => {
          obj.raycast = () => {};
        });
        setRoot(scene);
      },
      undefined,
      () => {
        if (!dead) {
          setRoot(null);
        }
      },
    );
    return () => {
      dead = true;
    };
  }, [id]);
  return root;
}

type V3 = [number, number, number];

function Box({
  material,
  position,
  scale,
  rotation,
}: {
  material: Material;
  position?: V3;
  scale?: V3;
  rotation?: V3;
}) {
  return (
    <mesh
      geometry={geo.box}
      material={material}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

function Rod({
  material,
  position,
  scale,
  rotation,
}: {
  material: Material;
  position?: V3;
  scale?: V3;
  rotation?: V3;
}) {
  return (
    <mesh
      geometry={geo.cyl}
      material={material}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

const BOOKS = [mat.bookRed, mat.bookBlue, mat.bookGreen, mat.vellum, mat.navy];

function Shelf({ position, side = false }: { position: V3; side?: boolean }) {
  return (
    <group position={position} rotation={side ? [0, Math.PI / 2, 0] : undefined}>
      <Box material={mat.woodDark} position={[0, 0.24, 0]} scale={[0.86, 0.06, 0.12]} />
      <Box material={mat.woodDark} position={[0, -0.24, 0]} scale={[0.86, 0.06, 0.12]} />
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={`book-${i}`}
          material={BOOKS[i % BOOKS.length]}
          position={[-0.62 + i * 0.2, -0.02 + (i % 3) * 0.025, 0.02]}
          scale={[0.14 + (i % 2) * 0.02, 0.34 + (i % 3) * 0.035, 0.13]}
          rotation={[0, 0, (i % 3 - 1) * 0.055]}
        />
      ))}
    </group>
  );
}

function ArticulatedLeg({
  index,
  hip,
  legsRef,
  shinsRef,
}: {
  index: number;
  hip: V3;
  legsRef: RefObject<(Group | null)[]>;
  shinsRef: RefObject<(Group | null)[]>;
}) {
  const side = hip[0] < 0 ? -1 : 1;
  const front = hip[2] < 0 ? -1 : 1;
  return (
    <group
      name={`scriptorium-leg-${index}`}
      ref={(node) => {
        legsRef.current[index] = node;
      }}
      position={hip}
    >
      <mesh geometry={geo.dodeca} material={mat.brass} scale={[0.27, 0.25, 0.27]} />
      <Box
        material={mat.copperDark}
        position={[side * 0.03, -0.18, front * 0.03]}
        scale={[0.18, 0.42, 0.2]}
        rotation={[front * 0.18, 0, side * 0.14]}
      />
      <group
        ref={(node) => {
          shinsRef.current[index] = node;
        }}
        position={[side * 0.08, -0.43, front * 0.08]}
      >
        <mesh geometry={geo.dodeca} material={mat.brass} scale={[0.2, 0.18, 0.2]} />
        <Box
          material={mat.woodDark}
          position={[side * 0.07, -0.34, front * 0.05]}
          scale={[0.14, 0.58, 0.16]}
          rotation={[front * -0.15, 0, side * -0.12]}
        />
        <group position={[side * 0.13, -0.66, front * 0.18]}>
          <Box material={mat.brass} scale={[0.34, 0.12, 0.52]} rotation={[0, side * 0.08, 0]} />
          <Box material={mat.woodDark} position={[0, -0.09, 0.06]} scale={[0.28, 0.08, 0.44]} />
        </group>
      </group>
    </group>
  );
}

export function WalkingScriptorium({
  deckRef,
  legsRef,
  shinsRef,
  smokeRef,
  stonesRef,
  bardRef,
  grimoireGlowRef,
}: {
  deckRef: Ref<Group>;
  legsRef: RefObject<(Group | null)[]>;
  shinsRef: RefObject<(Group | null)[]>;
  smokeRef: Ref<Group>;
  stonesRef: RefObject<(Mesh | null)[]>;
  bardRef: Ref<Group>;
  grimoireGlowRef: Ref<Mesh>;
}) {
  const costume = usePilotCostume("scriptorium");
  const hips: V3[] = [
    [-1.06, 0.88, -0.72],
    [1.06, 0.88, -0.72],
    [-1.06, 0.88, 0.68],
    [1.06, 0.88, 0.68],
  ];
  return (
    <group
      ref={deckRef}
      name="scriptorium"
      position={[WAGON.x, WAGON.y, WAGON.z]}
      rotation={[0, WAGON.yaw, 0]}
      scale={WAGON.scale}
    >
      {costume ? <primitive object={costume} /> : null}
      <group name="scriptorium-primitive-hull" visible={!costume}>
      <mesh geometry={geo.disc} material={mat.shade} position={[0, 0.03, 0]} scale={[4.1, 1, 3.3]} />

      <Box material={mat.woodDark} position={[0, 0.98, 0.02]} scale={[2.42, 0.25, 1.82]} />
      <Box material={mat.brass} position={[0, 0.84, 0.02]} scale={[2.5, 0.08, 1.9]} />
      <Box material={mat.wood} position={[0, 1.35, 0.28]} scale={[2.2, 0.7, 1.32]} />
      <Box material={mat.woodDark} position={[0, 1.67, 0.28]} scale={[2.28, 0.12, 1.4]} />
      <Box material={mat.copperDark} position={[0, 1.02, -0.95]} scale={[1.62, 0.12, 0.48]} />

      {[-1.05, 1.05].map((x) => (
        <group key={`corner-${x}`} position={[x, 1.38, 0.28]}>
          <Box material={mat.brass} scale={[0.09, 0.76, 0.09]} />
          <mesh geometry={geo.dodeca} material={mat.brass} position={[0, 0.38, 0]} scale={0.12} />
          <mesh geometry={geo.dodeca} material={mat.brass} position={[0, -0.38, 0]} scale={0.12} />
        </group>
      ))}

      <Box
        material={mat.woodDark}
        position={[-0.58, 1.92, 0.24]}
        scale={[1.28, 0.14, 1.56]}
        rotation={[0, 0, -0.13]}
      />
      <Box
        material={mat.wood}
        position={[0.58, 1.92, 0.24]}
        scale={[1.28, 0.14, 1.56]}
        rotation={[0, 0, 0.13]}
      />
      <Box material={mat.brass} position={[0, 2.04, 0.24]} scale={[0.08, 0.09, 1.65]} />

      <Shelf position={[0, 1.4, 0.98]} />
      <Shelf position={[1.13, 1.42, 0.28]} side />

      <group position={[-1.14, 1.44, 0.25]} rotation={[0, -Math.PI / 2, 0]}>
        <Box material={mat.brass} scale={[0.7, 0.53, 0.055]} />
        <Box material={mat.navyDeep} position={[0, 0, -0.045]} scale={[0.58, 0.42, 0.055]} />
        <Box material={mat.window} position={[0, 0, -0.08]} scale={[0.48, 0.32, 0.035]} />
        <Box material={mat.brass} position={[0, 0, -0.11]} scale={[0.045, 0.36, 0.025]} />
        <Box material={mat.brass} position={[0, 0, -0.11]} scale={[0.52, 0.04, 0.025]} />
      </group>

      <group position={[-0.56, 2.28, 0.43]}>
        <Rod material={mat.woodDark} scale={[0.18, 0.5, 0.18]} />
        <mesh geometry={geo.cylTaper} material={mat.brass} position={[0, 0.3, 0]} scale={[0.26, 0.13, 0.26]} />
        <group ref={smokeRef} name="chimney-smoke" position={[0, 0.52, 0]}>
          {[
            [0, 0, 0, 0.26],
            [0.09, 0.25, 0.02, 0.21],
            [-0.06, 0.47, -0.03, 0.16],
          ].map(([x, y, z, s], i) => (
            <mesh
              key={`smoke-${i}`}
              geometry={geo.dodeca}
              material={mat.smoke}
              position={[x, y, z]}
              scale={s}
            />
          ))}
        </group>
      </group>

      <group position={[0, 1.46, 1.02]}>
        <Rod material={mat.brass} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.055, 2.25, 0.055]} />
        <mesh geometry={geo.plane} material={mat.bannerCloth} scale={[1.42, 0.68, 1]} />
        <Box material={mat.brass} position={[-0.66, 0, 0.03]} scale={[0.045, 0.72, 0.025]} />
        <Box material={mat.brass} position={[0.66, 0, 0.03]} scale={[0.045, 0.72, 0.025]} />
      </group>

      <group name="front-podium" position={[0.25, 1.17, -1.1]} rotation={[-0.08, 0, 0]}>
        <Rod material={mat.copperDark} position={[0, -0.22, 0]} scale={[0.11, 0.54, 0.11]} />
        <Box material={mat.woodDark} position={[0, 0.12, 0]} scale={[0.92, 0.1, 0.56]} rotation={[0.42, 0, 0]} />
        <Box material={mat.brass} position={[0, 0.18, -0.02]} scale={[0.84, 0.045, 0.48]} rotation={[0.42, 0, 0]} />
        <mesh geometry={geo.plane} material={mat.paper} position={[-0.2, 0.32, -0.11]} scale={[0.35, 0.38, 1]} rotation={[-0.9, 0.12, 0.02]} />
        <mesh geometry={geo.plane} material={mat.paper} position={[0.2, 0.32, -0.11]} scale={[0.35, 0.38, 1]} rotation={[-0.9, -0.12, -0.02]} />
        <mesh
          ref={grimoireGlowRef}
          geometry={geo.octa}
          material={mat.rune}
          position={[0, 0.42, -0.04]}
          scale={[0.09, 0.09, 0.05]}
        />
      </group>

      {hips.map((hip, index) => (
        <ArticulatedLeg
          key={`leg-${index}`}
          index={index}
          hip={hip}
          legsRef={legsRef}
          shinsRef={shinsRef}
        />
      ))}
      </group>

      <Typomancer />
      <BardFamiliar bardRef={bardRef} />

      {SPELLS.map((spell, i) => {
        const angle = -1.05 + (i / Math.max(1, SPELLS.length - 1)) * 2.1;
        return (
          <group
            key={spell.id}
            position={[Math.sin(angle) * 1.18, 2.09 + Math.cos(angle) * 0.06, 0.24 + Math.cos(angle) * 0.67]}
          >
            <mesh
              name={`runestone-${spell.id}`}
              ref={(node) => {
                stonesRef.current[i] = node;
              }}
              geometry={geo.octa}
              material={mat[charmOf(spell.id)]}
              scale={[0.16, 0.21, 0.11]}
              rotation={[0, angle, Math.PI / 4]}
            />
            <mesh geometry={geo.ring} material={mat.brass} position={[0, 0, -0.015]} scale={0.28} />
          </group>
        );
      })}
    </group>
  );
}

function Typomancer() {
  return (
    <group name="mage" position={[0.2, 1.25, -0.78]} rotation={[0, Math.PI, 0]} scale={1.08}>
      <Rod material={mat.trousers} position={[-0.1, 0.18, 0]} scale={[0.1, 0.38, 0.1]} />
      <Rod material={mat.trousers} position={[0.1, 0.18, 0]} scale={[0.1, 0.38, 0.1]} />
      <Box material={mat.leather} position={[-0.1, -0.03, 0.06]} scale={[0.15, 0.09, 0.24]} />
      <Box material={mat.leather} position={[0.1, -0.03, 0.06]} scale={[0.15, 0.09, 0.24]} />
      <mesh geometry={geo.cylTaper} material={mat.coat} position={[0, 0.55, 0]} scale={[0.34, 0.58, 0.26]} />
      <mesh geometry={geo.cone} material={mat.coat} position={[0, 0.36, 0.06]} scale={[0.5, 0.56, 0.38]} rotation={[Math.PI, 0, 0]} />
      <Box material={mat.navy} position={[0, 0.73, 0.02]} scale={[0.4, 0.16, 0.22]} />
      <mesh geometry={geo.sphereHi} material={mat.skin} position={[0, 1.0, 0]} scale={[0.22, 0.24, 0.21]} />
      <mesh geometry={geo.dodeca} material={mat.hair} position={[0, 1.12, 0]} scale={[0.24, 0.18, 0.23]} />
      <mesh geometry={geo.cone} material={mat.hair} position={[-0.14, 1.04, 0.03]} scale={[0.08, 0.2, 0.08]} rotation={[0, 0, 0.5]} />
      <mesh geometry={geo.cone} material={mat.hair} position={[0.14, 1.04, 0.02]} scale={[0.07, 0.17, 0.07]} rotation={[0, 0, -0.5]} />
      <Rod material={mat.coat} position={[-0.24, 0.62, 0.15]} rotation={[0.75, 0, -0.45]} scale={[0.07, 0.36, 0.07]} />
      <Rod material={mat.coat} position={[0.24, 0.62, 0.15]} rotation={[0.75, 0, 0.45]} scale={[0.07, 0.36, 0.07]} />
      <mesh geometry={geo.sphere} material={mat.leather} position={[-0.2, 0.43, 0.28]} scale={0.085} />
      <mesh geometry={geo.sphere} material={mat.leather} position={[0.2, 0.43, 0.28]} scale={0.085} />
      <Box material={mat.brass} position={[0, 0.58, -0.24]} scale={[0.42, 0.05, 0.04]} />
      <group name="grimoire-board" position={[-0.34, 0.55, -0.08]} rotation={[0.12, 0.72, -0.18]}>
        <Box material={mat.navyDeep} scale={[0.27, 0.34, 0.075]} />
        <Box material={mat.brass} position={[0, 0, 0.02]} scale={[0.3, 0.37, 0.025]} />
        <Box material={mat.cover} position={[0, 0.02, 0.055]} scale={[0.23, 0.29, 0.025]} />
        {Array.from({ length: 12 }, (_, i) => (
          <Box
            key={`key-${i}`}
            material={i % 5 === 0 ? mat.rune : mat.vellum}
            position={[-0.075 + (i % 4) * 0.05, 0.075 - Math.floor(i / 4) * 0.055, 0.082]}
            scale={[0.036, 0.03, 0.012]}
          />
        ))}
      </group>
    </group>
  );
}

function BardFamiliar({ bardRef }: { bardRef: Ref<Group> }) {
  return (
    <group ref={bardRef} name="bard" position={[1.03, 1.72, 0.78]} scale={1.12}>
      <group name="bard-lectern" position={[0, -0.25, 0]}>
        <Box material={mat.wood} scale={[0.34, 0.18, 0.25]} />
        <Box material={mat.brass} position={[0, 0.12, 0]} scale={[0.37, 0.045, 0.28]} />
        <mesh geometry={geo.plane} material={mat.paper} position={[0, 0.23, -0.02]} scale={[0.24, 0.2, 1]} rotation={[-1.05, 0, 0]} />
        <mesh geometry={geo.plane} material={mat.bannerCloth} position={[0, -0.14, 0.14]} scale={[0.18, 0.25, 1]} />
      </group>
      <group name="quill-lute" position={[0, 0.23, 0.02]}>
        <mesh geometry={geo.dodeca} material={mat.bardHead} scale={[0.22, 0.2, 0.18]} />
        <mesh geometry={geo.sphere} material={mat.bardEye} position={[-0.065, 0.02, 0.13]} scale={[0.055, 0.06, 0.035]} />
        <mesh geometry={geo.sphere} material={mat.bardEye} position={[0.065, 0.02, 0.13]} scale={[0.055, 0.06, 0.035]} />
        <mesh geometry={geo.cone} material={mat.vellum} position={[0.04, 0.34, -0.02]} rotation={[0.2, 0, 0.25]} scale={[0.1, 0.45, 0.055]} />
        <mesh geometry={geo.cone} material={mat.bardHead} position={[-0.04, 0.29, -0.03]} rotation={[0.1, 0, -0.25]} scale={[0.065, 0.35, 0.045]} />
        <mesh geometry={geo.sphereHi} material={mat.wood} position={[0, -0.22, 0.03]} scale={[0.18, 0.22, 0.1]} />
        <mesh geometry={geo.ring} material={mat.brass} position={[0, -0.22, 0.135]} scale={0.22} />
        <Box material={mat.woodDark} position={[0, -0.07, 0.03]} scale={[0.045, 0.19, 0.045]} />
        <Rod material={mat.wood} position={[-0.13, -0.19, 0.08]} rotation={[0.45, 0, 0.9]} scale={[0.025, 0.17, 0.025]} />
        <Rod material={mat.wood} position={[0.13, -0.19, 0.08]} rotation={[0.45, 0, -0.9]} scale={[0.025, 0.17, 0.025]} />
      </group>
    </group>
  );
}

function ArcGlyph({ variant, material }: { variant: number; material: Material }) {
  const slant = variant % 2 === 0 ? 0.55 : -0.55;
  return (
    <group>
      <Box material={material} scale={[0.055, 0.34, 0.035]} rotation={[0, 0, slant]} />
      <Box
        material={material}
        position={[variant % 3 === 0 ? 0.12 : -0.1, 0.02, 0]}
        scale={[0.045, 0.26, 0.035]}
        rotation={[0, 0, -slant * 0.7]}
      />
      {variant % 3 !== 1 ? (
        <Box
          material={material}
          position={[0, variant % 2 === 0 ? -0.1 : 0.12, 0]}
          scale={[0.26, 0.04, 0.035]}
          rotation={[0, 0, variant % 4 === 0 ? 0.2 : -0.2]}
        />
      ) : (
        <mesh geometry={geo.ring} material={material} scale={0.19} />
      )}
      <mesh geometry={geo.sphere} material={mat.spark} position={[0, -0.25, 0]} scale={0.035} />
    </group>
  );
}

export function RuneArc({ marksRef }: { marksRef: RefObject<(Mesh | null)[]> }) {
  return (
    <group name="rune-arc" position={[-0.18, 1.95, -2.7]} rotation={[0.05, 0.02, 0]}>
      {Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 8) * Math.PI;
        const x = Math.cos(angle) * 1.95;
        const y = Math.sin(angle) * 0.68;
        return (
          <group key={`glyph-${i}`} position={[x, y, -Math.sin(angle) * 0.16]} rotation={[0, 0.05, (i - 4) * 0.12]}>
            <mesh
              ref={(node) => {
                marksRef.current[i] = node;
              }}
              geometry={geo.disc}
              material={i % 2 === 0 ? mat.rune : mat.runeViolet}
              scale={[0.42, 0.42, 0.055]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <group position={[0, 0, 0.05]} scale={0.9}>
              <ArcGlyph variant={i} material={i % 2 === 0 ? mat.runeFlat : mat.runeVioletFlat} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

export function InkSprite({ scale = 1 }: { scale?: number }) {
  return (
    <group name="threat-ink" scale={scale}>
      <mesh geometry={geo.dodeca} material={mat.inkWet} scale={[1.05, 0.92, 0.82]} rotation={[0.15, 0, -0.08]} />
      <mesh geometry={geo.sphereHi} material={mat.inkWet} position={[-0.42, -0.28, 0.05]} scale={[0.58, 0.45, 0.5]} />
      <mesh geometry={geo.sphereHi} material={mat.inkWet} position={[0.43, -0.32, 0.02]} scale={[0.46, 0.34, 0.43]} />
      <mesh geometry={geo.sphere} material={mat.inkWet} position={[-0.64, -0.52, -0.03]} scale={0.23} />
      <mesh geometry={geo.sphere} material={mat.inkWet} position={[0.64, -0.52, -0.05]} scale={0.18} />
      <mesh geometry={geo.cone} material={mat.inkWet} position={[-0.5, 0.58, -0.08]} rotation={[0, 0, -0.34]} scale={[0.22, 0.7, 0.2]} />
      <mesh geometry={geo.cone} material={mat.inkWet} position={[0.42, 0.55, -0.1]} rotation={[0, 0, 0.42]} scale={[0.19, 0.58, 0.18]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0.12, 0.16, 0.45]} scale={[0.42, 0.34, 0.18]} />
      <group position={[0.12, 0.18, 0.57]} rotation={[0, 0, -0.3]}>
        <mesh geometry={geo.torus} material={mat.comma} scale={[0.16, 0.19, 0.12]} />
        <mesh geometry={geo.sphere} material={mat.comma} position={[0.08, -0.16, 0]} scale={[0.07, 0.14, 0.055]} />
      </group>
      {[
        [-0.85, -0.45, 0.02, 0.1],
        [0.84, -0.55, -0.1, 0.075],
        [-0.4, -0.76, 0.08, 0.08],
      ].map(([x, y, z, s], i) => (
        <mesh key={`drop-${i}`} geometry={geo.sphere} material={mat.inkWet} position={[x, y, z]} scale={s} />
      ))}
    </group>
  );
}

function RunePlate({ position, rotation = [0, 0, 0] }: { position: V3; rotation?: V3 }) {
  return (
    <group position={position} rotation={rotation}>
      <Box material={mat.stone} scale={[0.38, 0.52, 0.12]} />
      <Box material={mat.navyDeep} position={[0, 0, 0.075]} scale={[0.24, 0.34, 0.035]} />
      <mesh geometry={geo.octa} material={mat.runeViolet} position={[0, 0, 0.11]} scale={[0.09, 0.14, 0.03]} />
    </group>
  );
}

export function RunicGolem() {
  const costume = usePilotCostume("golem");
  if (costume) {
    return <primitive object={costume} />;
  }
  return (
    <group name="threat-golem">
      <Box material={mat.stone} position={[0, 0.2, 0]} scale={[1.0, 0.72, 0.72]} rotation={[0.04, 0, 0.03]} />
      <Box material={mat.stoneDim} position={[0, 0.82, 0]} scale={[0.7, 0.48, 0.54]} />
      <Box material={mat.stone} position={[0, 1.22, 0]} scale={[1.18, 0.66, 0.78]} rotation={[-0.04, 0, -0.03]} />
      <Box material={mat.copperDark} position={[0, 1.2, 0.43]} scale={[0.56, 0.58, 0.08]} />
      <mesh geometry={geo.octa} material={mat.eye} position={[0, 1.2, 0.52]} scale={[0.23, 0.34, 0.08]} />
      <mesh geometry={geo.sphere} material={mat.inkWet} position={[0, 1.88, 0]} scale={[0.48, 0.42, 0.44]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0, 1.91, 0.3]} scale={[0.14, 0.12, 0.07]} />
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`} position={[side * 0.9, 1.04, 0]}>
          <mesh geometry={geo.dodeca} material={mat.stone} scale={[0.42, 0.48, 0.4]} />
          <Box material={mat.stone} position={[side * 0.12, -0.52, 0]} scale={[0.38, 0.68, 0.4]} rotation={[0, 0, side * -0.08]} />
          <mesh geometry={geo.dodeca} material={mat.stoneDim} position={[side * 0.16, -0.96, 0.04]} scale={[0.4, 0.3, 0.42]} />
        </group>
      ))}
      {[-0.42, 0.42].map((x) => (
        <group key={`foot-${x}`} position={[x, -0.45, 0.03]}>
          <Box material={mat.stone} scale={[0.38, 0.58, 0.42]} />
          <Box material={mat.stoneDim} position={[0, -0.34, 0.14]} scale={[0.45, 0.18, 0.56]} />
        </group>
      ))}
      <RunePlate position={[-0.86, 2.15, 0.05]} rotation={[0, 0.2, -0.32]} />
      <RunePlate position={[-0.3, 2.36, -0.02]} rotation={[0, 0.08, -0.1]} />
      <RunePlate position={[0.3, 2.36, -0.02]} rotation={[0, -0.08, 0.1]} />
      <RunePlate position={[0.86, 2.15, 0.05]} rotation={[0, -0.2, 0.32]} />
    </group>
  );
}

export function ParchmentHound() {
  return (
    <group name="threat-hound">
      <mesh geometry={geo.icosa} material={mat.inkWet} position={[-0.05, 0.12, 0]} scale={[1.05, 0.46, 0.45]} />
      <Box material={mat.parchment} position={[-0.18, 0.27, 0.06]} scale={[1.2, 0.16, 0.56]} rotation={[0.12, 0.08, -0.06]} />
      <Box material={mat.parchment} position={[-0.14, 0.02, -0.02]} scale={[1.05, 0.13, 0.5]} rotation={[-0.14, -0.06, 0.05]} />
      <mesh geometry={geo.dodeca} material={mat.inkWet} position={[0.72, 0.31, 0.04]} scale={[0.48, 0.42, 0.4]} />
      <mesh geometry={geo.cone} material={mat.parchment} position={[0.89, 0.31, 0.3]} rotation={[Math.PI / 2, 0, 0]} scale={[0.18, 0.34, 0.18]} />
      <mesh geometry={geo.cone} material={mat.parchment} position={[0.62, 0.74, 0.02]} rotation={[0, 0, -0.2]} scale={[0.16, 0.42, 0.12]} />
      <mesh geometry={geo.cone} material={mat.parchment} position={[0.88, 0.68, -0.03]} rotation={[0, 0, 0.2]} scale={[0.14, 0.36, 0.1]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0.88, 0.4, 0.26]} scale={[0.08, 0.075, 0.045]} />
      {[
        [-0.52, -0.38, 0.26, -0.12],
        [-0.52, -0.38, -0.25, 0.12],
        [0.38, -0.38, 0.24, 0.14],
        [0.38, -0.38, -0.24, -0.14],
      ].map(([x, y, z, rz], i) => (
        <group key={`hound-leg-${i}`} position={[x, y, z]} rotation={[0, 0, rz]}>
          <Box material={mat.inkWet} scale={[0.12, 0.58, 0.13]} />
          <mesh geometry={geo.tetra} material={mat.parchment} position={[0, -0.34, 0.08]} scale={[0.2, 0.2, 0.32]} />
        </group>
      ))}
      <mesh geometry={geo.cone} material={mat.parchment} position={[-0.88, 0.26, 0]} rotation={[0, 0, 1.2]} scale={[0.14, 0.54, 0.12]} />
    </group>
  );
}

export function InkSwarm() {
  const spots: [number, number, number, number][] = [
    [0, 0.1, 0, 0.62],
    [0.62, 0.45, 0.12, 0.42],
    [-0.58, 0.34, 0.18, 0.38],
    [0.32, 0.82, -0.24, 0.34],
    [-0.28, 0.9, -0.34, 0.3],
  ];
  return (
    <group name="threat-swarm">
      {spots.map(([x, y, z, s], i) => (
        <group key={`swarm-${i}`} position={[x, y, z]} scale={s} rotation={[0, 0, i % 2 ? 0.28 : -0.28]}>
          <InkSprite />
          <mesh geometry={geo.cone} material={mat.parchment} position={[-0.62, 0.05, -0.02]} rotation={[0, 0, -1.1]} scale={[0.16, 0.52, 0.08]} />
          <mesh geometry={geo.cone} material={mat.parchment} position={[0.62, 0.05, -0.02]} rotation={[0, 0, 1.1]} scale={[0.16, 0.52, 0.08]} />
        </group>
      ))}
    </group>
  );
}

export function ScrollWyrm() {
  return (
    <group name="threat-wyrm">
      {Array.from({ length: 7 }, (_, i) => {
        const angle = i * 0.7;
        return (
          <group key={`segment-${i}`} position={[Math.sin(angle) * 0.5, 0.18 + i * 0.24, -i * 0.25]} rotation={[0, angle * 0.2, Math.sin(angle) * 0.2]}>
            <mesh geometry={geo.dodeca} material={i % 2 === 0 ? mat.inkWet : mat.stone} scale={[0.48 - i * 0.025, 0.34, 0.38]} />
            <mesh geometry={geo.torus} material={i % 2 === 0 ? mat.runeViolet : mat.rune} scale={0.34} rotation={[Math.PI / 2, 0, 0]} />
            {i % 2 === 0 ? (
              <mesh geometry={geo.cone} material={mat.parchment} position={[0.45, 0, 0]} rotation={[0, 0, -1.1]} scale={[0.12, 0.42, 0.08]} />
            ) : null}
          </group>
        );
      })}
      <mesh geometry={geo.dodeca} material={mat.inkWet} position={[-0.43, 1.8, -1.55]} scale={[0.55, 0.44, 0.5]} />
      <mesh geometry={geo.cone} material={mat.parchment} position={[-0.68, 2.22, -1.58]} rotation={[0, 0, -0.35]} scale={[0.16, 0.44, 0.12]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[-0.58, 1.88, -1.18]} scale={[0.1, 0.09, 0.055]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[-0.28, 1.9, -1.17]} scale={[0.1, 0.09, 0.055]} />
    </group>
  );
}

export function Honk() {
  const costume = usePilotCostume("goose");
  if (costume) {
    return <primitive object={costume} />;
  }
  return (
    <group name="honk">
      <mesh geometry={geo.sphereHi} material={mat.goose} scale={[0.72, 0.52, 0.54]} />
      <mesh geometry={geo.sphereHi} material={mat.goose} position={[-0.3, 0.08, 0]} scale={[0.58, 0.44, 0.48]} />
      <Rod material={mat.goose} position={[0.42, 0.37, 0.02]} rotation={[0, 0, -0.48]} scale={[0.13, 0.52, 0.13]} />
      <mesh geometry={geo.sphereHi} material={mat.goose} position={[0.62, 0.72, 0.03]} scale={[0.28, 0.27, 0.27]} />
      <mesh geometry={geo.cone} material={mat.beak} position={[0.88, 0.69, 0.03]} rotation={[0, 0, -Math.PI / 2]} scale={[0.13, 0.38, 0.15]} />
      <mesh geometry={geo.sphere} material={mat.ink} position={[0.7, 0.79, 0.23]} scale={[0.042, 0.045, 0.03]} />
      <mesh geometry={geo.cone} material={mat.goose} position={[-0.18, 0.2, 0.34]} rotation={[1.35, 0.2, 0.15]} scale={[0.28, 0.62, 0.12]} />
      <Rod material={mat.beak} position={[-0.2, -0.48, 0.17]} scale={[0.045, 0.38, 0.045]} />
      <Rod material={mat.beak} position={[0.12, -0.48, -0.13]} scale={[0.045, 0.38, 0.045]} />
      <Box material={mat.beak} position={[-0.12, -0.69, 0.24]} scale={[0.24, 0.05, 0.11]} />
      <Box material={mat.beak} position={[0.2, -0.69, -0.06]} scale={[0.24, 0.05, 0.11]} />
      <Rod material={mat.navyDeep} position={[0.15, 0.08, 0.29]} rotation={[1.05, 0, 0]} scale={[0.018, 0.25, 0.018]} />
      <mesh geometry={geo.octa} material={mat.eye} position={[0.2, -0.1, 0.39]} scale={[0.11, 0.15, 0.06]} />
    </group>
  );
}

export function IcePatch() {
  return (
    <group name="ice-patch" position={[4.35, -0.03, -7.8]} rotation={[0, -0.15, 0]}>
      <group name="ink-river-near">
        {Array.from({ length: 9 }, (_, i) => (
          <mesh
            key={`ink-pool-${i}`}
            geometry={geo.disc}
            material={i < 4 ? mat.inkWet : mat.iceDeep}
            position={[Math.sin(i * 1.15) * 0.48, i * 0.006, (i - 4) * 1.22]}
            scale={[4.1 - Math.abs(i - 4) * 0.22, 1, 1.85]}
            rotation={[0, i * 0.14, 0]}
          />
        ))}
      </group>
      <mesh geometry={geo.road} material={mat.ice} position={[0.2, 0.06, 5.2]} scale={[0.68, 1, 0.26]} rotation={[0, 0.36, 0]} />
      {[
        [0.15, 1.15, 0.1, 0.42, 2.35, 0.4],
        [-1.05, 0.82, -0.55, 0.32, 1.65, 0.3],
        [1.22, 0.7, -1.4, 0.26, 1.38, 0.24],
        [-0.22, 0.52, 1.55, 0.2, 1.05, 0.2],
        [0.98, 0.48, 2.55, 0.18, 0.92, 0.18],
        [-0.78, 0.42, -2.55, 0.16, 0.82, 0.16],
        [0.42, 0.38, 3.4, 0.14, 0.72, 0.14],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <group key={`ice-cluster-${i}`} position={[x, y, z]} rotation={[0, i * 0.7, 0]}>
          <mesh geometry={geo.octa} material={mat.ice} scale={[sx, sy, sz]} rotation={[0.12, 0, 0.12]} />
          <mesh geometry={geo.tetra} material={mat.runeFlat} position={[sx * 0.7, -y * 0.28, sz]} scale={[sx * 0.6, sy * 0.55, sz * 0.6]} />
        </group>
      ))}
    </group>
  );
}

function LetterGlyph({ kind }: { kind: "A" | "I" | "F" | "X" }) {
  const bars: { position: V3; rotation?: V3; scale: V3 }[] =
    kind === "A"
      ? [
          { position: [-0.17, 0, 0], rotation: [0, 0, 0.36], scale: [0.1, 0.72, 0.07] },
          { position: [0.17, 0, 0], rotation: [0, 0, -0.36], scale: [0.1, 0.72, 0.07] },
          { position: [0, -0.05, 0], scale: [0.36, 0.09, 0.07] },
        ]
      : kind === "I"
        ? [
            { position: [0, 0, 0], scale: [0.11, 0.72, 0.07] },
            { position: [0, 0.32, 0], scale: [0.34, 0.08, 0.07] },
            { position: [0, -0.32, 0], scale: [0.34, 0.08, 0.07] },
          ]
        : kind === "F"
          ? [
              { position: [-0.13, 0, 0], scale: [0.11, 0.72, 0.07] },
              { position: [0.05, 0.28, 0], scale: [0.38, 0.09, 0.07] },
              { position: [0, 0.02, 0], scale: [0.28, 0.08, 0.07] },
            ]
          : [
              { position: [0, 0, 0], rotation: [0, 0, 0.55], scale: [0.11, 0.72, 0.07] },
              { position: [0, 0, 0], rotation: [0, 0, -0.55], scale: [0.11, 0.72, 0.07] },
            ];
  return (
    <group>
      {bars.map((bar, i) => (
        <Box key={`bar-${i}`} material={mat.runeFlat} {...bar} />
      ))}
    </group>
  );
}

export function Monolith({
  kind,
  position,
  rotation = [0, 0.35, 0],
  scale = 1,
}: {
  kind: "A" | "I" | "F" | "X";
  position: V3;
  rotation?: V3;
  scale?: number;
}) {
  return (
    <group name={`monolith-${kind}`} position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo.dodeca} material={mat.stone} position={[0, 0.16, 0]} scale={[0.82, 0.32, 0.72]} />
      <Box material={mat.slab} position={[0, 1.6, 0]} scale={[0.86, 3.2, 0.34]} rotation={[0, 0, -0.04]} />
      <Box material={mat.stone} position={[0.05, 3.1, 0]} scale={[0.72, 0.2, 0.3]} rotation={[0, 0, -0.1]} />
      <group position={[0, 1.7, 0.2]} scale={1.2}>
        <LetterGlyph kind={kind} />
      </group>
      <mesh geometry={geo.ring} material={mat.brass} position={[0, 0.62, 0.2]} scale={0.24} />
    </group>
  );
}

function ArchiveTower({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geo.cyl} material={mat.archive} position={[0, 2.2, 0]} scale={[1.1, 4.4, 1.1]} />
      <mesh geometry={geo.cyl} material={mat.archDark} position={[0, 1.5, 1.02]} scale={[0.33, 1.0, 0.08]} />
      <mesh geometry={geo.cyl} material={mat.archDark} position={[0, 3.2, 1.02]} scale={[0.28, 0.82, 0.08]} />
      <mesh geometry={geo.cone} material={mat.copperDark} position={[0, 4.75, 0]} scale={[1.25, 1.5, 1.25]} />
      <mesh geometry={geo.octa} material={mat.rune} position={[0, 5.62, 0]} scale={0.24} />
      {[0, 1, 2].map((i) => (
        <mesh
          key={`ring-${i}`}
          geometry={geo.torus}
          material={mat.brass}
          position={[0, 1.0 + i * 1.45, 0]}
          scale={[1.12, 1.12, 1.12]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
    </group>
  );
}

export function ArchiveLandmark() {
  return (
    <group name="archive" position={[0, 0, 0]} scale={1.52}>
      <mesh
        name="archive-collision"
        geometry={geo.box}
        material={mat.archive}
        position={[0, 5.9, -1.2]}
        scale={[12, 11.8, 6]}
        visible={false}
      />
      <mesh geometry={geo.cone} material={mat.mountain} position={[0, 3.0, -3.5]} scale={[13, 10, 8]} rotation={[0, 0.1, 0]} />
      <mesh geometry={geo.cone} material={mat.mountain} position={[-8, 4.2, -4.5]} scale={[9, 12, 7]} />
      <mesh geometry={geo.cone} material={mat.mountain} position={[8, 3.8, -4]} scale={[8, 11, 7]} />

      <group position={[0, 1.2, 0]}>
        {[0, 1, 2].map((row) => (
          <group key={`archive-tier-${row}`} position={[0, row * 1.42, -row * 0.35]}>
            <Box material={mat.archive} scale={[10 - row * 1.15, 1.25, 2.2]} />
            {[-3.2, -1.1, 1.1, 3.2].map((x) => (
              <group key={`arch-${row}-${x}`} position={[x * (1 - row * 0.08), -0.1, 1.12]}>
                <Rod material={mat.archDark} scale={[0.43, 0.9, 0.1]} />
                <mesh geometry={geo.ring} material={mat.archDark} position={[0, 0.43, 0]} scale={[0.58, 0.76, 0.2]} />
              </group>
            ))}
          </group>
        ))}
      </group>
      <ArchiveTower position={[-3.5, 4.0, -0.25]} scale={0.9} />
      <ArchiveTower position={[3.7, 3.6, -0.35]} scale={0.82} />
      <ArchiveTower position={[0.1, 5.3, -1.5]} scale={1.15} />

      <group position={[0, 6.9, 0.8]}>
        <mesh geometry={geo.torus} material={mat.brass} scale={2.45} />
        <mesh geometry={geo.torus} material={mat.runeFlat} scale={2.0} />
        <mesh geometry={geo.ring} material={mat.runeVioletFlat} position={[0, 0, -0.04]} scale={2.2} />
      </group>
      <Box material={mat.brass} position={[0, 0.28, 2.3]} scale={[8.8, 0.28, 2.4]} />
      <Box material={mat.archive} position={[-6.6, 4.7, 0.6]} scale={[4.8, 0.34, 0.62]} rotation={[0, 0, 0.2]} />
      <Box material={mat.archive} position={[6.3, 4.5, 0.4]} scale={[4.6, 0.34, 0.62]} rotation={[0, 0, -0.17]} />
    </group>
  );
}

export function FloatingIsle({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group name="isle" position={position} scale={scale}>
      <mesh geometry={geo.dodeca} material={mat.mountain} scale={[2.5, 0.72, 1.9]} />
      <mesh geometry={geo.cone} material={mat.mountain} position={[0, -1.15, 0]} rotation={[Math.PI, 0, 0]} scale={[1.6, 2.2, 1.3]} />
      <mesh geometry={geo.dodeca} material={mat.meadow} position={[0, 0.5, 0]} scale={[2.32, 0.3, 1.72]} />
      <mesh geometry={geo.cone} material={mat.tuftTeal} position={[-0.45, 1.25, 0.1]} scale={[0.42, 1.15, 0.42]} />
      <Box material={mat.archive} position={[0.42, 0.95, -0.08]} scale={[0.62, 0.85, 0.52]} />
      <mesh geometry={geo.octa} material={mat.rune} position={[0.42, 1.55, -0.08]} scale={0.16} />
    </group>
  );
}

export function RoadLantern({ position, rotation = [0, 0, 0] }: { position: V3; rotation?: V3 }) {
  return (
    <group name="lantern" position={position} rotation={rotation}>
      <Rod material={mat.woodDark} position={[0, 0.75, 0]} scale={[0.075, 1.5, 0.075]} />
      <Box material={mat.brass} position={[0, 1.5, 0]} scale={[0.28, 0.08, 0.28]} />
      <mesh geometry={geo.dodeca} material={mat.lamp} position={[0, 1.73, 0]} scale={[0.23, 0.3, 0.23]} />
      <mesh geometry={geo.cone} material={mat.copperDark} position={[0, 1.99, 0]} scale={[0.3, 0.25, 0.3]} />
    </group>
  );
}

export function DeparturePad({ position, rotation = [0, 0, 0] }: { position: V3; rotation?: V3 }) {
  return (
    <group name="departure-pad" position={position} rotation={rotation}>
      <Box material={mat.slab} position={[0, 0.08, 0]} scale={[7, 0.16, 7]} />
      <Box material={mat.stone} position={[0, 0.02, 0]} scale={[7.3, 0.08, 7.3]} />
      <Box material={mat.woodDark} position={[0, 0.01, 3.55]} scale={[2.2, 0.1, 0.7]} />
      <Box material={mat.slab} position={[0, -0.02, 3.95]} scale={[2.0, 0.1, 0.55]} />
      <Box material={mat.brass} position={[0, 0.06, 3.55]} scale={[2.3, 0.04, 0.12]} />
      {[
        [-3.2, -3.2],
        [3.2, -3.2],
        [-3.2, 3.2],
        [3.2, 3.2],
      ].map(([x, z]) => (
        <group key={`pad-post-${x}-${z}`} position={[x, 0.42, z]}>
          <Box material={mat.stone} scale={[0.28, 0.84, 0.28]} />
          <Box material={mat.brass} position={[0, 0.28, 0]} scale={[0.42, 0.1, 0.16]} />
        </group>
      ))}
      <group name="waymark-beacon" position={[0, 0.16, -3.05]}>
        <Box material={mat.woodDark} position={[0, 0.22, 0]} scale={[0.7, 0.44, 0.36]} />
        <Box material={mat.brass} position={[-0.28, 1.05, 0]} scale={[0.08, 1.5, 0.08]} />
        <Box material={mat.brass} position={[0.28, 1.05, 0]} scale={[0.08, 1.5, 0.08]} />
        <mesh geometry={geo.sphere} material={mat.brass} position={[-0.28, 1.82, 0]} scale={0.1} />
        <mesh geometry={geo.sphere} material={mat.brass} position={[0.28, 1.82, 0]} scale={0.1} />
        <mesh geometry={geo.torus} material={mat.brass} position={[0, 1.42, 0]} scale={0.42} />
        <mesh geometry={geo.octa} material={mat.rune} position={[0, 1.42, 0]} scale={0.22} />
      </group>
      {[-1, 1].map((side) => (
        <mesh
          key={`pad-banner-${side}`}
          geometry={geo.plane}
          material={mat.bannerCloth}
          position={[side * 1.15, 0.55, 3.35]}
          scale={[0.28, 0.42, 1]}
        />
      ))}
      <mesh
        name="departure-collision"
        geometry={geo.box}
        material={mat.slab}
        position={[0, 0.6, 0]}
        scale={[7, 1.2, 7]}
        visible={false}
      />
    </group>
  );
}

export function ClearingGround() {
  return (
    <group name="module-clearing">
      <mesh geometry={geo.disc} material={mat.meadow} position={[0, 0.012, 0]} scale={[18, 1, 18]} />
      <mesh geometry={geo.disc} material={mat.paver} position={[0, 0.03, 0]} scale={[8.4, 1, 8.4]} />
    </group>
  );
}

export function TerraceRamp() {
  return (
    <group name="module-ramp">
      <Box material={mat.slab} position={[0, 0.55, 0]} rotation={[-0.15, 0, 0]} scale={[6, 0.18, 10]} />
      <Box material={mat.stone} position={[0, 0.12, 0.2]} scale={[6.2, 0.7, 10]} />
      {([-1, 1] as const).map((side) => (
        <Box key={`ramp-rail-${side}`} material={mat.woodDark} position={[side * 2.9, 0.85, 0]} scale={[0.12, 0.35, 9.4]} />
      ))}
    </group>
  );
}

export function WordlockShrine({ position, rotation = [0, 0, 0] }: { position: V3; rotation?: V3 }) {
  return (
    <group name="wordlock-shrine" position={position} rotation={rotation}>
      <mesh geometry={geo.cyl} material={mat.slab} position={[0, 0.22, 0]} scale={[1.65, 0.44, 1.65]} />
      <mesh geometry={geo.cyl} material={mat.stone} position={[0, 0.92, 0]} scale={[0.62, 1.05, 0.62]} />
      <mesh geometry={geo.octa} material={mat.rune} position={[0, 0.88, 0.36]} scale={0.1} />
      <mesh geometry={geo.torus} material={mat.brass} position={[0, 1.58, 0.08]} rotation={[0.85, 0, 0]} scale={0.92} />
      {[-0.62, -0.31, 0, 0.31, 0.62].map((x, i) => (
        <Box
          key={`shrine-tile-${i}`}
          material={mat.paper}
          position={[x, 1.78 - Math.abs(x) * 0.18, 0.22]}
          scale={[0.24, 0.36, 0.04]}
        />
      ))}
    </group>
  );
}

export function RouteStraight() {
  return (
    <group name="module-straight">
      <Box material={mat.paver} position={[0, MODULE_DECK.topY * 0.55, 0]} scale={[6, MODULE_DECK.topY, 12]} />
      <Box material={mat.roadEdge} position={[0, MODULE_DECK.topY * 0.28, 0]} scale={[6.4, MODULE_DECK.topY * 0.55, 12]} />
    </group>
  );
}

export function RouteBend() {
  return (
    <group name="module-bend" position={[2.4, 0, -1.2]} rotation={[0, Math.PI / 4, 0]}>
      <Box material={mat.paver} position={[0, MODULE_DECK.topY * 0.55, 0]} scale={[6, MODULE_DECK.topY, 12]} />
      <Box material={mat.roadEdge} position={[0, MODULE_DECK.topY * 0.28, 0]} scale={[6.4, MODULE_DECK.topY * 0.55, 12]} />
    </group>
  );
}

export function RouteEdge({ side = 1 }: { side?: 1 | -1 }) {
  return (
    <group name="module-edge" position={[side * 4.1, 0, 0]}>
      <Box material={mat.soil} position={[0, 0.28, 0]} scale={[2, 0.55, 12]} />
      <Box material={mat.meadowDeep} position={[side * 0.15, 0.62, 0]} scale={[1.7, 0.4, 12]} />
    </group>
  );
}

export function RouteBridge() {
  return (
    <group name="module-bridge">
      <Box material={mat.slab} position={[0, MODULE_DECK.topY * 0.55, 0]} scale={[7, MODULE_DECK.topY, 8]} />
      {([-1, 1] as const).map((side) => (
        <Box key={`rail-${side}`} material={mat.stone} position={[side * 3.25, 0.9, 0]} scale={[0.26, 1.8, 8]} />
      ))}
      {[-2.4, 0, 2.4].map((z) => (
        <Box key={`tie-${z}`} material={mat.brass} position={[0, MODULE_DECK.topY, z]} scale={[6.2, 0.03, 0.2]} />
      ))}
      <mesh
        geometry={geo.torus}
        material={mat.stone}
        position={[0, -0.42, 0]}
        scale={[2.15, 1.15, 2.6]}
        rotation={[0, 0, Math.PI / 2]}
      />
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const).map((sz) => (
          <group key={`bridge-post-${sx}-${sz}`} position={[sx * 3.15, 1.2, sz * 3.55]}>
            <Box material={mat.slab} scale={[0.4, 2.2, 0.4]} />
            <mesh geometry={geo.sphere} material={mat.brass} position={[0, 1.2, 0]} scale={0.18} />
          </group>
        )),
      )}
    </group>
  );
}

export function InkRiver() {
  return (
    <group name="ink-river" position={[8.2, -0.12, 0]}>
      <Box material={mat.soil} position={[-2.6, 0.28, 0]} scale={[1.3, 0.7, 12]} />
      <Box material={mat.soil} position={[2.6, 0.28, 0]} scale={[1.3, 0.7, 12]} />
      <Box material={mat.inkWet} position={[0, 0.04, 0]} scale={[6, 0.12, 12]} />
      <Box material={mat.ice} position={[0.25, 0.12, -0.8]} scale={[4.4, 0.08, 7.2]} />
      {[
        [-0.8, 0.7, -1.6, 0.22, 1.1],
        [0.9, 0.5, 0.4, 0.16, 0.8],
        [0.1, 0.42, 1.8, 0.12, 0.62],
      ].map(([x, y, z, sx, sy], i) => (
        <mesh
          key={`river-ice-${i}`}
          geometry={geo.octa}
          material={mat.ice}
          position={[x, y, z]}
          scale={[sx, sy, sx]}
        />
      ))}
    </group>
  );
}
