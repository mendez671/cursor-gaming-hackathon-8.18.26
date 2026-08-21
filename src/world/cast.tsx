import type { Ref, RefObject } from "react";
import type { Group, Mesh } from "three";
import { SPELLS } from "../game/content";
import { charmOf, geo, mat } from "./kit";

const BOOK_MAT = [mat.bookRed, mat.bookGreen, mat.bookBlue, mat.navy, mat.woodDark];

function MeshBox({
  material,
  position,
  scale,
  rotation,
}: {
  material: typeof mat.wood;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
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

export function WalkingScriptorium({
  deckRef,
  legsRef,
  shinsRef,
  smokeRef,
  stonesRef,
}: {
  deckRef: Ref<Group>;
  legsRef: RefObject<(Group | null)[]>;
  shinsRef: RefObject<(Group | null)[]>;
  smokeRef: Ref<Group>;
  stonesRef: RefObject<(Mesh | null)[]>;
}) {
  const hips: [number, number, number][] = [
    [-0.98, 1.02, 0.62],
    [0.98, 1.02, 0.62],
    [-0.98, 1.02, -0.62],
    [0.98, 1.02, -0.62],
  ];

  return (
    <group ref={deckRef} name="scriptorium" position={[0, 0, 0.15]}>
      <mesh geometry={geo.disc} material={mat.shade} position={[0, 0.03, 0]} scale={[3.8, 1, 3.1]} />
      <MeshBox material={mat.woodDark} position={[0, 0.98, 0]} scale={[2.15, 0.2, 1.85]} />
      <MeshBox material={mat.brass} position={[0, 0.86, 0]} scale={[2.22, 0.06, 1.92]} />
      <MeshBox material={mat.wood} position={[0, 1.42, 0.18]} scale={[1.95, 0.72, 1.28]} />
      <MeshBox material={mat.woodDark} position={[0, 1.84, 0.12]} scale={[2.15, 0.1, 1.55]} />
      <MeshBox material={mat.brass} position={[0, 1.91, 0.12]} scale={[2.22, 0.04, 1.62]} />
      <MeshBox material={mat.wood} position={[0, 1.12, -0.72]} scale={[1.55, 0.08, 0.62]} />
      <MeshBox material={mat.navyDeep} position={[-1.0, 1.45, 0.18]} scale={[0.06, 0.38, 0.55]} />
      <MeshBox material={mat.navyDeep} position={[1.0, 1.45, 0.18]} scale={[0.06, 0.38, 0.55]} />
      <MeshBox material={mat.woodDark} position={[0, 1.38, 0.84]} scale={[1.82, 0.62, 0.1]} />
      {[-0.62, -0.31, 0, 0.31, 0.62].map((x, i) => (
        <MeshBox
          key={`shelf-${i}`}
          material={mat.wood}
          position={[x, 1.18, 0.78]}
          scale={[0.26, 0.07, 0.14]}
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <MeshBox
          key={`book-${i}`}
          material={BOOK_MAT[i % BOOK_MAT.length]}
          position={[-0.7 + (i % 5) * 0.35, 1.32 + (i < 5 ? 0 : 0.2), 0.76]}
          scale={[0.11, 0.2, 0.14]}
          rotation={[0, 0, (i % 3) * 0.04 - 0.04]}
        />
      ))}
      <mesh
        geometry={geo.cyl}
        material={mat.woodDark}
        position={[0.62, 2.12, 0.42]}
        scale={[0.15, 0.4, 0.15]}
      />
      <mesh
        geometry={geo.cylTaper}
        material={mat.brass}
        position={[0.62, 2.34, 0.42]}
        scale={[0.22, 0.1, 0.22]}
      />
      <group ref={smokeRef} name="chimney-smoke" position={[0.62, 2.48, 0.42]}>
        <mesh geometry={geo.sphere} material={mat.smoke} position={[0, 0.12, 0]} scale={[0.22, 0.18, 0.22]} />
        <mesh geometry={geo.sphere} material={mat.smoke} position={[0.06, 0.32, 0.04]} scale={[0.18, 0.16, 0.18]} />
        <mesh geometry={geo.sphere} material={mat.smoke} position={[-0.04, 0.5, -0.02]} scale={[0.14, 0.12, 0.14]} />
      </group>
      <mesh
        geometry={geo.cyl}
        material={mat.woodDark}
        position={[0, 1.98, 0.92]}
        rotation={[0, 0, 1.57]}
        scale={[0.05, 1.55, 0.05]}
      />
      <mesh
        geometry={geo.plane}
        material={mat.bannerCloth}
        position={[0, 1.52, 0.98]}
        scale={[1.28, 0.7, 1]}
      />
      <mesh
        geometry={geo.plane}
        material={mat.wagonArt}
        position={[1.02, 1.48, 0.18]}
        rotation={[0, 1.57, 0]}
        scale={[0.72, 0.42, 1]}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <MeshBox
          key={`banner-rune-${i}`}
          material={mat.brass}
          position={[-0.44 + i * 0.22, 1.56, 0.99]}
          scale={[0.13, 0.16, 0.02]}
        />
      ))}
      <MeshBox material={mat.woodDark} position={[0.04, 1.28, -0.82]} scale={[0.7, 0.08, 0.42]} />
      <MeshBox
        material={mat.wood}
        position={[0.04, 1.42, -0.88]}
        scale={[0.74, 0.06, 0.38]}
        rotation={[0.55, 0, 0]}
      />
      <mesh
        geometry={geo.plane}
        material={mat.paper}
        position={[-0.14, 1.52, -0.92]}
        scale={[0.32, 0.4, 1]}
        rotation={[-0.85, 0.18, 0.08]}
      />
      <mesh
        geometry={geo.plane}
        material={mat.paper}
        position={[0.22, 1.52, -0.92]}
        scale={[0.32, 0.4, 1]}
        rotation={[-0.85, -0.16, -0.06]}
      />
      <Typomancer />
      <BardFamiliar />
      {SPELLS.map((spell, i) => {
        const x = -0.88 + (i % 5) * 0.44;
        const z = i < 5 ? 0.42 : 0.12;
        return (
          <mesh
            key={spell.id}
            name={`runestone-${spell.id}`}
            ref={(node) => {
              stonesRef.current[i] = node;
            }}
            geometry={geo.octa}
            material={mat[charmOf(spell.id)]}
            position={[x, 1.98, z]}
            scale={[0.15, 0.19, 0.1]}
          />
        );
      })}
      {hips.map((hip, i) => (
        <group
          key={`leg-${i}`}
          name={`scriptorium-leg-${i}`}
          ref={(node) => {
            legsRef.current[i] = node;
          }}
          position={hip}
        >
          <mesh geometry={geo.sphere} material={mat.brass} scale={[0.2, 0.2, 0.2]} />
          <mesh
            geometry={geo.cyl}
            material={mat.wood}
            position={[0, -0.32, 0]}
            scale={[0.14, 0.55, 0.14]}
          />
          <group
            ref={(node) => {
              shinsRef.current[i] = node;
            }}
            position={[0, -0.62, 0]}
          >
            <mesh geometry={geo.sphere} material={mat.brass} scale={[0.16, 0.16, 0.16]} />
            <mesh
              geometry={geo.cyl}
              material={mat.woodDark}
              position={[0, -0.3, 0]}
              scale={[0.12, 0.5, 0.12]}
            />
            <MeshBox material={mat.brass} position={[0, -0.58, 0.1]} scale={[0.26, 0.1, 0.42]} />
          </group>
        </group>
      ))}
    </group>
  );
}

function Typomancer() {
  return (
    <group name="mage" position={[0.05, 1.18, -0.7]} rotation={[0, Math.PI, 0]}>
      <mesh geometry={geo.cyl} material={mat.trousers} position={[-0.07, 0.22, 0]} scale={[0.09, 0.38, 0.09]} />
      <mesh geometry={geo.cyl} material={mat.trousers} position={[0.07, 0.22, 0]} scale={[0.09, 0.38, 0.09]} />
      <MeshBox material={mat.leather} position={[-0.07, 0.02, 0.04]} scale={[0.12, 0.07, 0.18]} />
      <MeshBox material={mat.leather} position={[0.07, 0.02, 0.04]} scale={[0.12, 0.07, 0.18]} />
      <mesh
        geometry={geo.cylTaper}
        material={mat.coat}
        position={[0, 0.58, 0]}
        scale={[0.28, 0.52, 0.22]}
      />
      <mesh
        geometry={geo.cone}
        material={mat.coat}
        position={[0, 0.42, 0]}
        scale={[0.42, 0.38, 0.3]}
        rotation={[3.14, 0, 0]}
      />
      <MeshBox material={mat.navy} position={[0, 0.78, 0.02]} scale={[0.32, 0.16, 0.18]} />
      <mesh geometry={geo.sphere} material={mat.skin} position={[0, 0.98, 0.02]} scale={[0.2, 0.22, 0.2]} />
      <mesh geometry={geo.sphere} material={mat.hair} position={[0, 1.08, 0]} scale={[0.22, 0.16, 0.22]} />
      <mesh geometry={geo.sphere} material={mat.hair} position={[-0.08, 1.04, 0.04]} scale={[0.12, 0.1, 0.12]} />
      <mesh geometry={geo.sphere} material={mat.hair} position={[0.08, 1.02, 0.02]} scale={[0.11, 0.1, 0.11]} />
      <mesh
        geometry={geo.cyl}
        material={mat.coat}
        position={[-0.2, 0.62, 0.12]}
        rotation={[0.8, 0, -0.4]}
        scale={[0.06, 0.32, 0.06]}
      />
      <mesh
        geometry={geo.cyl}
        material={mat.coat}
        position={[0.22, 0.64, 0.14]}
        rotation={[0.7, 0, 0.35]}
        scale={[0.06, 0.3, 0.06]}
      />
      <mesh geometry={geo.sphere} material={mat.leather} position={[-0.16, 0.48, 0.24]} scale={[0.07, 0.07, 0.07]} />
      <mesh geometry={geo.sphere} material={mat.leather} position={[0.18, 0.5, 0.26]} scale={[0.07, 0.07, 0.07]} />
      <group name="grimoire-board" position={[-0.22, 0.52, 0.02]} rotation={[0.15, 0.7, -0.2]}>
        <MeshBox material={mat.navyDeep} scale={[0.22, 0.28, 0.06]} />
        <MeshBox material={mat.brass} position={[0, 0, 0.01]} scale={[0.24, 0.3, 0.02]} />
        <MeshBox material={mat.cover} position={[0, 0.02, 0.035]} scale={[0.18, 0.22, 0.02]} />
        {Array.from({ length: 11 }, (_, i) => (
          <MeshBox
            key={`key-${i}`}
            material={mat.vellum}
            position={[-0.06 + (i % 6) * 0.024, (i < 6 ? 0.04 : -0.02), 0.05]}
            scale={[0.02, 0.018, 0.012]}
          />
        ))}
        <mesh
          geometry={geo.octa}
          material={mat.rune}
          position={[0, 0.08, 0.05]}
          scale={[0.04, 0.04, 0.02]}
        />
      </group>
    </group>
  );
}

function BardFamiliar() {
  return (
    <group name="bard" position={[1.05, 1.78, 0.55]}>
      <MeshBox material={mat.wood} position={[0, 0.08, 0]} scale={[0.28, 0.16, 0.22]} />
      <MeshBox material={mat.woodDark} position={[0, 0.2, 0]} scale={[0.32, 0.04, 0.26]} />
      <mesh
        geometry={geo.plane}
        material={mat.paper}
        position={[0, 0.28, 0.02]}
        scale={[0.2, 0.16, 1]}
        rotation={[-1.15, 0, 0]}
      />
      <mesh
        geometry={geo.plane}
        material={mat.navy}
        position={[0, 0.02, 0.12]}
        scale={[0.16, 0.22, 1]}
      />
      <mesh
        geometry={geo.octa}
        material={mat.rune}
        position={[0, 0.04, 0.13]}
        scale={[0.06, 0.08, 0.02]}
      />
      <group name="quill-lute" position={[0, 0.48, 0.04]}>
        <mesh geometry={geo.sphereHi} material={mat.bardHead} scale={[0.2, 0.2, 0.2]} />
        <mesh geometry={geo.sphere} material={mat.bardEye} position={[-0.05, 0.02, 0.08]} scale={[0.045, 0.05, 0.03]} />
        <mesh geometry={geo.sphere} material={mat.bardEye} position={[0.05, 0.02, 0.08]} scale={[0.045, 0.05, 0.03]} />
        <mesh
          geometry={geo.cone}
          material={mat.vellum}
          position={[0.02, 0.22, -0.02]}
          rotation={[0.15, 0, 0.35]}
          scale={[0.07, 0.28, 0.04]}
        />
        <mesh
          geometry={geo.sphere}
          material={mat.wood}
          position={[0, -0.16, 0.02]}
          scale={[0.16, 0.2, 0.1]}
        />
        <MeshBox material={mat.woodDark} position={[0, -0.04, 0.02]} scale={[0.04, 0.16, 0.04]} />
        <mesh
          geometry={geo.cyl}
          material={mat.wood}
          position={[-0.1, -0.1, 0.06]}
          rotation={[0.4, 0, 0.9]}
          scale={[0.02, 0.12, 0.02]}
        />
        <mesh
          geometry={geo.cyl}
          material={mat.wood}
          position={[0.1, -0.1, 0.06]}
          rotation={[0.4, 0, -0.9]}
          scale={[0.02, 0.12, 0.02]}
        />
      </group>
    </group>
  );
}

export function RuneArc({
  marksRef,
}: {
  marksRef: RefObject<(Mesh | null)[]>;
}) {
  return (
    <group name="rune-arc" position={[0, 1.72, -2.15]}>
      {Array.from({ length: 7 }, (_, i) => {
        const t = (i / 6) * Math.PI;
        const x = Math.cos(t) * 1.55;
        const y = Math.sin(t) * 0.42;
        const z = -Math.sin(t) * 0.12;
        return (
          <group key={`arc-${i}`} position={[x, y, z]} rotation={[1.2, 0, (i - 3) * 0.18]}>
            <mesh
              ref={(node) => {
                marksRef.current[i] = node;
              }}
              geometry={geo.torus}
              material={i % 2 === 0 ? mat.rune : mat.runeViolet}
              scale={[0.42, 0.42, 0.42]}
            />
            <mesh
              geometry={geo.disc}
              material={i % 2 === 0 ? mat.runeViolet : mat.rune}
              rotation={[1.57, 0, 0]}
              scale={[0.28, 0.28, 0.28]}
            />
          </group>
        );
      })}
    </group>
  );
}

export function InkSprite({ scale = 1 }: { scale?: number }) {
  return (
    <group name="threat-ink" scale={scale}>
      <mesh geometry={geo.sphereHi} material={mat.inkCorrupt} scale={[1.15, 0.95, 1.05]} />
      <mesh
        geometry={geo.sphere}
        material={mat.inkCorrupt}
        position={[0.42, -0.22, 0.18]}
        scale={[0.55, 0.42, 0.48]}
      />
      <mesh
        geometry={geo.sphere}
        material={mat.inkCorrupt}
        position={[-0.38, 0.12, 0.16]}
        scale={[0.42, 0.38, 0.4]}
      />
      <mesh
        geometry={geo.sphere}
        material={mat.inkCorrupt}
        position={[0.08, -0.48, 0.08]}
        scale={[0.38, 0.28, 0.32]}
      />
      <mesh
        geometry={geo.sphere}
        material={mat.inkCorrupt}
        position={[-0.22, -0.35, -0.22]}
        scale={[0.3, 0.22, 0.28]}
      />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0.12, 0.18, 0.48]} scale={[0.42, 0.42, 0.22]} />
      <mesh
        geometry={geo.torus}
        material={mat.comma}
        position={[0.14, 0.16, 0.58]}
        rotation={[1.2, 0.4, 0.2]}
        scale={[0.16, 0.16, 0.4]}
      />
      <mesh
        geometry={geo.sphere}
        material={mat.comma}
        position={[0.2, 0.04, 0.58]}
        scale={[0.08, 0.1, 0.06]}
      />
    </group>
  );
}

export function RunicGolem() {
  return (
    <group name="threat-golem">
      <MeshBox material={mat.stone} position={[0, -0.15, 0]} scale={[0.95, 0.7, 0.7]} />
      <MeshBox material={mat.inkCorrupt} position={[0, 0.42, 0]} scale={[0.55, 0.42, 0.48]} />
      <MeshBox material={mat.stone} position={[0, 0.95, 0]} scale={[1.05, 0.72, 0.78]} />
      <mesh geometry={geo.disc} material={mat.navyDeep} position={[0, 0.95, 0.42]} rotation={[1.57, 0, 0]} scale={[0.55, 0.55, 0.55]} />
      <mesh geometry={geo.octa} material={mat.eye} position={[0, 0.95, 0.46]} scale={[0.22, 0.32, 0.08]} />
      <mesh geometry={geo.sphere} material={mat.stone} position={[0, 1.52, 0]} scale={[0.48, 0.48, 0.48]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0, 1.55, 0.22]} scale={[0.16, 0.16, 0.08]} />
      <MeshBox material={mat.stone} position={[-0.72, 0.72, 0]} scale={[0.32, 0.85, 0.32]} />
      <MeshBox material={mat.stone} position={[0.72, 0.72, 0]} scale={[0.32, 0.85, 0.32]} />
      <MeshBox material={mat.parchment} position={[-0.72, 0.55, 0.12]} scale={[0.36, 0.12, 0.4]} rotation={[0.2, 0.2, 0]} />
      <MeshBox material={mat.parchment} position={[0.72, 0.82, 0.1]} scale={[0.36, 0.1, 0.38]} rotation={[-0.15, -0.2, 0]} />
      {[-0.55, -0.18, 0.18, 0.55].map((x, i) => (
        <MeshBox
          key={`plate-${i}`}
          material={i % 2 === 0 ? mat.rune : mat.runeViolet}
          position={[x, 1.95, 0.05]}
          scale={[0.22, 0.32, 0.05]}
          rotation={[0.15, 0, x * 0.25]}
        />
      ))}
    </group>
  );
}

export function ParchmentHound() {
  return (
    <group name="threat-hound">
      <mesh
        geometry={geo.capsule}
        material={mat.inkCorrupt}
        position={[0, 0.12, 0]}
        rotation={[0, 0, 1.57]}
        scale={[0.28, 0.85, 0.28]}
      />
      <MeshBox material={mat.parchment} position={[0, 0.18, 0.05]} scale={[1.15, 0.12, 0.32]} rotation={[0.1, 0.15, 0]} />
      <MeshBox material={mat.parchment} position={[0.1, 0.02, -0.05]} scale={[0.95, 0.1, 0.28]} rotation={[-0.2, -0.2, 0.1]} />
      <MeshBox material={mat.inkCorrupt} position={[0.55, 0.28, 0.08]} scale={[0.38, 0.28, 0.28]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0.7, 0.32, 0.16]} scale={[0.1, 0.1, 0.06]} />
      {[
        [-0.35, -0.22, 0.16],
        [-0.35, -0.22, -0.14],
        [0.28, -0.22, 0.16],
        [0.28, -0.22, -0.14],
      ].map((p, i) => (
        <mesh
          key={`hound-leg-${i}`}
          geometry={geo.cyl}
          material={mat.inkCorrupt}
          position={p as [number, number, number]}
          scale={[0.05, 0.38, 0.05]}
        />
      ))}
      <mesh
        geometry={geo.cone}
        material={mat.parchment}
        position={[-0.62, 0.22, 0]}
        rotation={[0, 0, 1.2]}
        scale={[0.12, 0.35, 0.08]}
      />
    </group>
  );
}

export function InkSwarm() {
  const spots: [number, number, number, number][] = [
    [0, 0.1, 0, 0.72],
    [0.55, 0.22, 0.2, 0.48],
    [-0.5, 0.05, 0.18, 0.42],
    [0.2, 0.38, -0.28, 0.38],
    [-0.15, -0.05, -0.35, 0.34],
  ];
  return (
    <group name="threat-swarm">
      {spots.map(([x, y, z, s], i) => (
        <group key={`imp-${i}`} position={[x, y, z]} scale={s}>
          <InkSprite />
        </group>
      ))}
    </group>
  );
}

export function ScrollWyrm() {
  return (
    <group name="threat-wyrm">
      {Array.from({ length: 6 }, (_, i) => (
        <group key={`seg-${i}`} position={[Math.sin(i * 0.55) * 0.18, 0.15 + i * 0.22, -i * 0.28]}>
          <MeshBox
            material={i % 2 === 0 ? mat.inkCorrupt : mat.stone}
            scale={[0.42 - i * 0.02, 0.32, 0.36]}
            rotation={[0.15, i * 0.2, 0]}
          />
          {i % 2 === 0 ? (
            <MeshBox
              material={mat.parchment}
              position={[0.22, 0, 0]}
              scale={[0.08, 0.28, 0.4]}
              rotation={[0.3, 0.4, 0]}
            />
          ) : null}
        </group>
      ))}
      <mesh geometry={geo.sphere} material={mat.inkCorrupt} position={[0.08, 1.48, -1.55]} scale={[0.38, 0.32, 0.42]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0.02, 1.52, -1.38]} scale={[0.1, 0.1, 0.06]} />
      <mesh geometry={geo.sphere} material={mat.eye} position={[0.16, 1.52, -1.38]} scale={[0.1, 0.1, 0.06]} />
    </group>
  );
}

export function Honk() {
  return (
    <group name="honk">
      <mesh geometry={geo.sphereHi} material={mat.goose} scale={[0.72, 0.5, 0.55]} />
      <mesh
        geometry={geo.cyl}
        material={mat.goose}
        position={[0.28, 0.28, 0.04]}
        rotation={[0, 0, 0.55]}
        scale={[0.1, 0.36, 0.1]}
      />
      <mesh geometry={geo.sphere} material={mat.goose} position={[0.48, 0.46, 0.06]} scale={[0.26, 0.26, 0.26]} />
      <MeshBox material={mat.beak} position={[0.66, 0.42, 0.06]} scale={[0.2, 0.07, 0.1]} />
      <mesh geometry={geo.sphere} material={mat.ink} position={[0.54, 0.5, 0.16]} scale={[0.04, 0.04, 0.03]} />
      <MeshBox
        material={mat.goose}
        position={[-0.05, 0.16, 0.28]}
        scale={[0.38, 0.08, 0.24]}
        rotation={[0.25, 0.15, 0.1]}
      />
      <MeshBox
        material={mat.goose}
        position={[-0.05, 0.16, -0.26]}
        scale={[0.36, 0.08, 0.22]}
        rotation={[-0.2, -0.1, 0.08]}
      />
      <mesh
        geometry={geo.cyl}
        material={mat.navyDeep}
        position={[0.08, -0.02, 0.12]}
        rotation={[0.9, 0, 0]}
        scale={[0.015, 0.18, 0.015]}
      />
      <mesh geometry={geo.octa} material={mat.eye} position={[0.12, -0.12, 0.2]} scale={[0.1, 0.12, 0.06]} />
      <mesh
        geometry={geo.cyl}
        material={mat.beak}
        position={[-0.12, -0.28, 0.12]}
        scale={[0.04, 0.22, 0.04]}
      />
      <mesh
        geometry={geo.cyl}
        material={mat.beak}
        position={[0.08, -0.28, -0.08]}
        scale={[0.04, 0.2, 0.04]}
      />
    </group>
  );
}

export function IcePatch() {
  return (
    <group name="ice-patch" position={[4.2, 0.02, -5.4]}>
      <mesh geometry={geo.disc} material={mat.iceDeep} scale={[4.2, 1, 3.1]} />
      <mesh geometry={geo.disc} material={mat.ice} position={[0.2, 0.04, 0.1]} scale={[3.4, 1, 2.4]} />
      {[
        [0.35, 0.85, 0.15, 0.42, 1.65, 0.42],
        [-0.85, 0.55, -0.35, 0.28, 1.05, 0.28],
        [1.15, 0.48, -0.55, 0.22, 0.92, 0.22],
        [-0.15, 0.38, 0.75, 0.18, 0.72, 0.18],
        [0.95, 0.32, 0.6, 0.16, 0.58, 0.16],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh
          key={`crystal-${i}`}
          geometry={geo.octa}
          material={mat.ice}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          rotation={[0.15, i * 0.7, 0.1]}
        />
      ))}
    </group>
  );
}

function LetterGlyph({
  kind,
}: {
  kind: "A" | "I" | "F" | "X";
}) {
  if (kind === "A") {
    return (
      <group>
        <MeshBox material={mat.navyDeep} position={[-0.16, -0.04, 0]} scale={[0.11, 0.7, 0.07]} rotation={[0, 0, 0.38]} />
        <MeshBox material={mat.navyDeep} position={[0.16, -0.04, 0]} scale={[0.11, 0.7, 0.07]} rotation={[0, 0, -0.38]} />
        <MeshBox material={mat.navyDeep} position={[0, -0.04, 0]} scale={[0.4, 0.12, 0.08]} />
        <MeshBox material={mat.navyDeep} position={[0, 0.28, 0]} scale={[0.14, 0.14, 0.07]} />
      </group>
    );
  }
  if (kind === "I") {
    return (
      <group>
        <MeshBox material={mat.navyDeep} position={[0, 0, 0]} scale={[0.12, 0.7, 0.06]} />
        <MeshBox material={mat.navyDeep} position={[0, 0.32, 0]} scale={[0.32, 0.08, 0.06]} />
        <MeshBox material={mat.navyDeep} position={[0, -0.32, 0]} scale={[0.32, 0.08, 0.06]} />
      </group>
    );
  }
  if (kind === "F") {
    return (
      <group>
        <MeshBox material={mat.navyDeep} position={[-0.16, 0, 0]} scale={[0.12, 0.7, 0.06]} />
        <MeshBox material={mat.navyDeep} position={[0.04, 0.28, 0]} scale={[0.36, 0.1, 0.06]} />
        <MeshBox material={mat.navyDeep} position={[-0.02, 0.02, 0]} scale={[0.26, 0.08, 0.06]} />
      </group>
    );
  }
  return (
    <group>
      <MeshBox material={mat.navyDeep} position={[0, 0, 0]} scale={[0.12, 0.72, 0.06]} rotation={[0, 0, 0.55]} />
      <MeshBox material={mat.navyDeep} position={[0, 0, 0]} scale={[0.12, 0.72, 0.06]} rotation={[0, 0, -0.55]} />
    </group>
  );
}

export function Monolith({
  kind,
  position,
}: {
  kind: "A" | "I" | "F" | "X";
  position: [number, number, number];
}) {
  return (
    <group name={`monolith-${kind}`} position={position} rotation={[0, 0.35, 0]}>
      <MeshBox material={mat.slab} position={[0, 1.7, 0]} scale={[1.05, 3.4, 0.32]} />
      <MeshBox material={mat.stone} position={[0, 0.08, 0]} scale={[1.25, 0.16, 0.5]} />
      <group position={[0, 1.85, 0.18]} scale={[1.25, 1.25, 1.25]}>
        <LetterGlyph kind={kind} />
      </group>
    </group>
  );
}

export function ArchiveLandmark() {
  return (
    <group name="archive" position={[0, 0, 0]}>
      <MeshBox material={mat.mountain} position={[0, 4.2, -3]} scale={[18, 9.2, 8]} />
      <MeshBox material={mat.mountain} position={[-6.5, 7.4, -4]} scale={[8, 6.5, 6]} />
      <MeshBox material={mat.mountain} position={[6.2, 6.8, -3.5]} scale={[7, 5.8, 5.5]} />
      {[0, 1, 2, 3].map((row) => (
        <group key={`terrace-${row}`} position={[0, 1.4 + row * 1.55, 1.1 - row * 0.35]}>
          <MeshBox material={mat.archive} scale={[10 - row * 1.1, 1.4, 2.2]} />
          {[-3.2, -1.05, 1.05, 3.2].map((x) => (
            <MeshBox
              key={`arch-${row}-${x}`}
              material={mat.archDark}
              position={[x * (1 - row * 0.08), 0.05, 1.05]}
              scale={[1.15, 1.05, 0.35]}
            />
          ))}
        </group>
      ))}
      <MeshBox material={mat.archive} position={[-2.2, 8.6, 0.2]} scale={[1.4, 3.8, 1.4]} />
      <MeshBox material={mat.archive} position={[2.4, 8.2, 0.4]} scale={[1.2, 3.2, 1.2]} />
      <mesh geometry={geo.sphere} material={mat.lamp} position={[0, 7.8, 1.8]} scale={[0.55, 0.55, 0.55]} />
      <MeshBox material={mat.brass} position={[0, 0.2, 2.2]} scale={[8.4, 0.25, 2.4]} />
    </group>
  );
}

export function FloatingIsle({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group name="isle" position={position} scale={scale}>
      <MeshBox material={mat.mountain} position={[0, 0, 0]} scale={[2.4, 0.55, 1.8]} />
      <mesh geometry={geo.cone} material={mat.tuft} position={[-0.4, 0.7, 0.1]} scale={[0.35, 1.1, 0.35]} />
      <mesh geometry={geo.cone} material={mat.tuftDark} position={[0.45, 0.55, -0.15]} scale={[0.28, 0.85, 0.28]} />
      <MeshBox material={mat.archive} position={[0.15, 0.45, 0.2]} scale={[0.4, 0.5, 0.35]} />
    </group>
  );
}

export function RoadLantern({ position }: { position: [number, number, number] }) {
  return (
    <group name="lantern" position={position}>
      <mesh geometry={geo.cyl} material={mat.woodDark} position={[0, 0.7, 0]} scale={[0.08, 1.4, 0.08]} />
      <MeshBox material={mat.wood} position={[0, 1.45, 0]} scale={[0.22, 0.08, 0.22]} />
      <mesh geometry={geo.sphere} material={mat.lamp} position={[0, 1.62, 0]} scale={[0.2, 0.2, 0.2]} />
    </group>
  );
}
