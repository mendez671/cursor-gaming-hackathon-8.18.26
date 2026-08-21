import { useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { useAudioDirector } from "./audio/browser";
import {
  normalizeCasterInput,
  RULES,
  SPELLS,
  THREATS,
} from "./game/content";
import {
  createInitialState,
  glyphs,
  reduce,
  type GameState,
} from "./game/machine";
import { WorldLayer } from "./world/WorldLayer";

function hint(state: GameState): string {
  if (state.phase === "AFTERMATH") {
    if (state.runResult === "lost") {
      return "The line broke. Press R to begin again.";
    }
    return "The line held. Press R to begin again.";
  }
  if (state.phase === "RESOLVING") {
    if (state.lastOutcome === "goose") {
      return "The Mildly Disappointed Goose has arrived.";
    }
    if (state.lastOutcome === "empty_hit") {
      return "Too late. The threat lands.";
    }
    if (state.lastOutcome === "panic") {
      return "Half a spell. The threat lands.";
    }
    if (state.lastOutcome === "fizzle") {
      return "The phrase scattered.";
    }
    return "The grimoire turns the page.";
  }
  if (state.lastOutcome === "fizzle") {
    return "The phrase scattered. Type it again.";
  }
  if (state.phase === "TYPING") {
    return "The grimoire holds the line. Escape clears.";
  }
  return "Type the incantation. No mouse needed.";
}

export function App() {
  const [state, dispatch] = useReducer(reduce, undefined, createInitialState);
  const audio = useAudioDirector(state);
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const unlockRef = useRef(audio.unlockFromKey);
  const resetAudioRef = useRef(audio.reset);
  unlockRef.current = audio.unlockFromKey;
  resetAudioRef.current = audio.reset;
  const [wellMode, setWellMode] = useState<"canvas" | "flat">(() => {
    if (typeof window === "undefined") {
      return "flat";
    }
    return new URLSearchParams(window.location.search).has("flat")
      ? "flat"
      : "canvas";
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "READY" && state.phase !== "TYPING") {
      return;
    }
    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      dispatch({ type: "TICK", deltaMs: now - last });
      last = now;
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "RESOLVING") {
      return;
    }
    const hold =
      state.lastOutcome === "goose" ? RULES.gooseHoldMs : RULES.resolveHoldMs;
    const id = window.setTimeout(() => {
      dispatch({ type: "FINISH_RESOLVE" });
    }, hold);
    return () => window.clearTimeout(id);
  }, [state.phase, state.lastOutcome]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      unlockRef.current();
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (state.phase === "AFTERMATH") {
          resetAudioRef.current();
        }
        dispatch({ type: "CANCEL" });
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (state.phase === "AFTERMATH") {
          resetAudioRef.current();
          dispatch({ type: "RESTART" });
          return;
        }
        dispatch({ type: "FORCE_CAST" });
        return;
      }
      if (
        state.phase === "AFTERMATH" &&
        (event.key === "r" || event.key === "R")
      ) {
        event.preventDefault();
        resetAudioRef.current();
        dispatch({ type: "RESTART" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase]);

  const marks = glyphs(state.recommendation.incantation, state.buffer);
  const playable = state.phase === "READY" || state.phase === "TYPING";
  const acceptingKeys = playable || state.phase === "RESOLVING";
  const showCaret = playable;
  const caretAt = state.buffer.length;
  const casterValue = state.phase === "RESOLVING" ? state.heldBuffer : state.buffer;
  const commitInput = (rawValue: string) => {
    const value = normalizeCasterInput(rawValue);
    if (value === null) {
      if (inputRef.current) {
        inputRef.current.value = casterValue;
      }
      return;
    }
    dispatch({ type: "TYPE", value });
  };
  const ttiRatio =
    state.ttiTotalMs <= 0 ? 0 : Math.max(0, state.ttiRemainingMs / state.ttiTotalMs);
  const ttiSeconds = (state.ttiRemainingMs / 1000).toFixed(1);
  const approach = 0.68 + (1 - ttiRatio) * 0.42;

  return (
    <div
      className="stage"
      data-phase={state.phase}
      data-spell-id={state.recommendation.spellId}
      data-reason={state.recommendation.reasonLabel}
      data-threat-id={state.threat.id}
      data-locked={state.promptLocked ? "true" : "false"}
      data-hits={String(state.hits)}
      data-run={state.runResult}
      data-misfire={state.misfireId ?? ""}
      data-bard={state.bardLineId ?? ""}
      data-recent={state.bardMemory.recentIds.join(",")}
      data-well={wellMode}
      data-skin={wellMode}
      data-world={wellMode === "canvas" ? "frontier" : "flat"}
      data-held={state.heldBuffer}
      data-audio={audio.lastCue || "locked"}
      data-audio-line={audio.lastLineId ?? ""}
      data-audio-pending={audio.pendingLineId ?? ""}
      data-audio-unlocked={audio.unlocked ? "true" : "false"}
      data-audio-ctx={audio.contextState}
    >
      <WorldLayer
        view={{
          ttiRatio,
          struck: state.threatStruck,
          landed: state.threatLanded,
          goose: state.goosePresent,
          kind: state.threat.tags[0] ?? "fleshy",
          phase: state.phase,
          spellId: state.recommendation.spellId,
          coolingIds: state.coolingIds,
          threatIndex: state.threatIndex,
          threatCount: THREATS.length,
          runResult: state.runResult,
          bardSpeaking: Boolean(state.bardSubtitle),
          locked: state.promptLocked,
          typedRatio:
            state.recommendation.incantation.length === 0
              ? 0
              : state.buffer.length / state.recommendation.incantation.length,
        }}
        onMode={setWellMode}
      />

      <header className="mast">
        <p className="sigil">SPELLCHECK</p>
        <p className="tag">Every typo is canon.</p>
        <p
          className="bard"
          data-testid="bard-subtitle"
          data-line={state.bardLineId ?? ""}
          hidden={!state.bardSubtitle}
        >
          {state.bardSubtitle}
        </p>
      </header>

      <main className="lectern">
        <section
          className="well"
          data-struck={state.threatStruck ? "true" : "false"}
          data-landed={state.threatLanded ? "true" : "false"}
          data-goose={state.goosePresent ? "true" : "false"}
          data-threat={state.threat.id}
          data-webgl={wellMode === "canvas" ? "true" : "false"}
          aria-label="Threat"
        >
          <p className="hits" data-testid="hits" aria-label={`${state.hits} of ${RULES.loseHits} hits`}>
            {Array.from({ length: RULES.loseHits }, (_, i) => (
              <span key={i} data-filled={i < state.hits ? "true" : "false"}>
                {i < state.hits ? "●" : "○"}
              </span>
            ))}
          </p>
          <div
            className="wyrm"
            data-kind={state.threat.tags[0] ?? "fleshy"}
            style={{ "--approach": String(approach) } as CSSProperties}
            aria-hidden="true"
          />
          {state.goosePresent ? (
            <div className="goose" data-testid="goose" aria-hidden="true" />
          ) : null}
          <div className="bar-track">
            <div
              className="bar-fill"
              data-testid="threat-bar"
              style={{ transform: `scaleX(${ttiRatio})` }}
            />
          </div>
          <p className="tti" data-testid="tti">
            {ttiSeconds}s
          </p>
          <p className="well-label" data-testid="threat-name">
            {state.goosePresent
              ? "The Mildly Disappointed Goose"
              : state.threatStruck
                ? `${state.threat.displayName} yields.`
                : state.threatLanded
                  ? `${state.threat.displayName} lands.`
                  : state.threat.displayName}
          </p>
        </section>

        <section className="page">
          {state.phase === "AFTERMATH" ? (
            <p className="outcome-banner" data-testid="outcome-banner">
              {state.runResult === "won" ? "THE LINE HELD" : "THE LINE BROKE"}
            </p>
          ) : null}
          <p className="reason" data-testid="reason-chip">
            {state.recommendation.reasonLabel}
          </p>
          <p
            className="cue"
            data-testid="incantation-cue"
            data-pronunciation={state.recommendation.pronunciation}
            aria-label={`${state.recommendation.displayName}. ${state.recommendation.pronunciation}`}
          >
            {marks.map((g, i) => (
              <span
                key={`${g.ch}-${i}`}
                className={`glyph glyph-${g.status}`}
                data-status={g.status}
              >
                {showCaret && i === caretAt ? (
                  <span className="nib" data-testid="nib" aria-hidden="true" />
                ) : null}
                {g.ch === " " ? "\u00a0" : g.ch}
              </span>
            ))}
            {showCaret && caretAt >= marks.length ? (
              <span className="nib" data-testid="nib" aria-hidden="true" />
            ) : null}
          </p>
          <p className="hint" data-testid="hint">
            {hint(state)}
          </p>
          <ul className="cooling" data-testid="cooldown-strip" aria-label="Spent spells">
            {SPELLS.filter(
              (spell) =>
                state.coolingIds.includes(spell.id) ||
                (state.coolingIds.length > 0 &&
                  spell.id === state.recommendation.spellId),
            ).map((spell) => {
              const cooling = state.coolingIds.includes(spell.id);
              return (
                <li
                  key={spell.id}
                  data-spell={spell.id}
                  data-cooling={cooling ? "true" : "false"}
                  data-ready={cooling ? "false" : "true"}
                >
                  {cooling ? "SPENT · " : "NEXT · "}
                  {spell.incantation}
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <input
            ref={inputRef}
            id="caster"
            className="caster"
            data-testid="caster"
            aria-label="Incantation"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={casterValue}
        disabled={!acceptingKeys}
        onChange={(event) => {
          unlockRef.current();
          if (composingRef.current) {
            return;
          }
          commitInput(event.target.value);
        }}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={(event) => {
          composingRef.current = false;
          commitInput(event.currentTarget.value);
        }}
        onBlur={() => {
          if (acceptingKeys) {
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      />
    </div>
  );
}
