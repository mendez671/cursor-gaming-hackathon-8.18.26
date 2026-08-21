import { Canvas, events } from "@react-three/fiber";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ACESFilmicToneMapping } from "three";
import { StorybookFrontier } from "./StorybookFrontier";
import type { WorldView } from "./view";

export type { WorldView };

function wantsFlat(): boolean {
  return new URLSearchParams(window.location.search).has("flat");
}

function canWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

function prefersFreeze(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initialGl(): boolean {
  return !wantsFlat() && canWebGL();
}

class WorldErrorGate extends Component<
  { children: ReactNode; onFail: () => void },
  { ok: boolean }
> {
  state = { ok: true };

  static getDerivedStateFromError(): { ok: boolean } {
    return { ok: false };
  }

  componentDidCatch(): void {
    this.props.onFail();
  }

  render(): ReactNode {
    return this.state.ok ? this.props.children : null;
  }
}

function deadEvents(state: Parameters<typeof events>[0]) {
  const manager = events(state);
  manager.enabled = false;
  return manager;
}

export function WorldLayer({
  view,
  onMode,
}: {
  view: WorldView;
  onMode: (mode: "canvas" | "flat") => void;
}) {
  const viewRef = useRef<WorldView | null>(view);
  viewRef.current = view;
  const [useGl, setUseGl] = useState(initialGl);

  useEffect(() => {
    if (wantsFlat() || !canWebGL()) {
      setUseGl(false);
      onMode("flat");
      return;
    }
    onMode(useGl ? "canvas" : "flat");
  }, [onMode, useGl]);

  const fail = () => {
    setUseGl(false);
    onMode("flat");
  };

  if (!useGl) {
    return null;
  }

  return (
    <div className="world-gl" data-testid="well-canvas" aria-hidden="true">
      <WorldErrorGate onFail={fail}>
        <Canvas
          fallback={null}
          camera={{ position: [7.35, 5.55, 9.4], fov: 38, near: 0.1, far: 220 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          frameloop={prefersFreeze() ? "demand" : "always"}
          events={deadEvents}
          style={{ pointerEvents: "none" }}
          onCreated={({ gl, camera, scene }) => {
            gl.domElement.tabIndex = -1;
            gl.domElement.style.pointerEvents = "none";
            gl.domElement.setAttribute("aria-hidden", "true");
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
            camera.lookAt(-0.45, 1.0, -4.8);
            (
              window as Window & { __SPELLCHECK_SCENE?: typeof scene }
            ).__SPELLCHECK_SCENE = scene;
            onMode("canvas");
          }}
        >
          <StorybookFrontier viewRef={viewRef as RefObject<WorldView | null>} />
        </Canvas>
      </WorldErrorGate>
    </div>
  );
}
