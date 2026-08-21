import bardFile from "../../docs/ready/data/bard-lines.json";

export type BardLine = {
  id: string;
  event: string;
  subtitle: string;
  priority: number;
  speakFrequency: string;
  cooldownSeconds: number;
  maximumPerRun: number;
  phaseGate?: string;
  conditions?: {
    firstErrorThisRun?: boolean;
    minimumRepeatCount?: number;
    misfireId?: string;
    atImpact?: boolean;
  };
};

export type BardEvent = {
  name: string;
  runStart?: boolean;
  recovering?: boolean;
  firstErrorThisRun?: boolean;
  firstSuccess?: boolean;
  repeatCount?: number;
  misfireId?: string;
  atImpact?: boolean;
};

export type BardMemory = {
  recentIds: string[];
  usedCount: Record<string, number>;
};

const pack = bardFile as {
  recentBlockCount: number;
  lines: BardLine[];
};

export const BARD_RECENT_BLOCK = pack.recentBlockCount;

export function emptyBardMemory(): BardMemory {
  return { recentIds: [], usedCount: {} };
}

function eligible(line: BardLine, event: BardEvent, memory: BardMemory): boolean {
  if (line.event !== event.name) {
    return false;
  }
  if (line.phaseGate === "runStart" && !event.runStart) {
    return false;
  }
  const used = memory.usedCount[line.id] ?? 0;
  if (used >= line.maximumPerRun) {
    return false;
  }
  if (memory.recentIds.includes(line.id)) {
    return false;
  }
  const cond = line.conditions;
  if (cond?.firstErrorThisRun && !event.firstErrorThisRun) {
    return false;
  }
  if (
    cond?.minimumRepeatCount !== undefined &&
    (event.repeatCount ?? 0) < cond.minimumRepeatCount
  ) {
    return false;
  }
  if (cond?.misfireId && cond.misfireId !== event.misfireId) {
    return false;
  }
  if (cond?.atImpact && !event.atImpact) {
    return false;
  }
  if (line.speakFrequency === "occasionally") {
    return Boolean(event.firstSuccess || event.recovering);
  }
  if (line.speakFrequency === "usually") {
    return used === 0;
  }
  return true;
}

function pick(event: BardEvent, memory: BardMemory): BardLine | null {
  const pool = pack.lines.filter((line) => eligible(line, event, memory));
  if (pool.length === 0) {
    return null;
  }
  pool.sort((a, b) => {
    if (event.recovering) {
      const usedA = memory.usedCount[a.id] ?? 0;
      const usedB = memory.usedCount[b.id] ?? 0;
      if (usedA !== usedB) {
        return usedA - usedB;
      }
    }
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.id.localeCompare(b.id);
  });
  return pool[0];
}

export function considerBard(
  memory: BardMemory,
  event: BardEvent,
  current: { lineId: string | null; subtitle: string; busyPriority: number },
): {
  memory: BardMemory;
  lineId: string | null;
  subtitle: string;
  busyPriority: number;
} {
  const line = pick(event, memory);
  if (!line) {
    return {
      memory,
      lineId: current.lineId,
      subtitle: current.subtitle,
      busyPriority: current.busyPriority,
    };
  }
  if (current.busyPriority > 0 && line.priority < current.busyPriority) {
    return {
      memory,
      lineId: current.lineId,
      subtitle: current.subtitle,
      busyPriority: current.busyPriority,
    };
  }
  const usedCount = {
    ...memory.usedCount,
    [line.id]: (memory.usedCount[line.id] ?? 0) + 1,
  };
  return {
    memory: {
      recentIds: [line.id, ...memory.recentIds].slice(0, BARD_RECENT_BLOCK),
      usedCount,
    },
    lineId: line.id,
    subtitle: line.subtitle,
    busyPriority: line.priority,
  };
}
