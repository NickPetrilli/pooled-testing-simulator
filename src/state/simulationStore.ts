import { create } from "zustand";
import { PooledTestingEngine } from "../simulation/engine";
import { createMetrics, deriveMetrics } from "../simulation/metrics";
import type { Person, Pool, SimulationConfig, SimulationEvent, SimulationMetrics, TimelinePoint } from "../types/simulation";
import { eventDelay } from "../animations/timing";
import { poolTarget, poolCenter, subgroupSepX, RISE_Y, SUB_R } from "../utils/layout";

type PlaybackStatus = "idle" | "running" | "paused" | "complete";

interface SimulationState {
  config: SimulationConfig;
  people: Person[];
  pools: Record<string, Pool>;
  metrics: SimulationMetrics;
  timeline: TimelinePoint[];
  events: SimulationEvent[];
  currentEvent?: SimulationEvent;
  playbackStatus: PlaybackStatus;
  step: number;
  updateConfig: (config: Partial<SimulationConfig>) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

let generator: Generator<SimulationEvent> | undefined;
let timer: number | undefined;

const defaultConfig: SimulationConfig = {
  populationSize: 128,
  infectionRate: 2,
  groupSize: 8,
  speed: 1.4,
};

function clearRunner() {
  if (timer !== undefined) {
    window.clearTimeout(timer);
    timer = undefined;
  }
}

function scheduleNext(get: () => SimulationState, set: (partial: Partial<SimulationState>) => void) {
  clearRunner();
  const state = get();
  if (state.playbackStatus !== "running" || !generator) return;

  const next = generator.next();
  if (next.done) {
    set({ playbackStatus: "complete" });
    return;
  }

  applyEvent(next.value, get, set);
  timer = window.setTimeout(() => scheduleNext(get, set), eventDelay(next.value, get().config.speed));
}

function applyEvent(
  event: SimulationEvent,
  get: () => SimulationState,
  set: (partial: Partial<SimulationState>) => void,
) {
  const state = get();
  const nextPeople = state.people.map((person) => ({ ...person }));
  const nextPools = { ...state.pools };
  let metrics = state.metrics;

  const updatePeople = (personIds: number[], updater: (person: Person, index: number) => Person) => {
    personIds.forEach((personId, index) => {
      nextPeople[personId] = updater(nextPeople[personId], index);
    });
  };

  switch (event.type) {
    case "POPULATION_GENERATED":
      set({
        people: event.people.map((person) => ({ ...person })),
        metrics: event.metrics,
        currentEvent: event,
        events: [event],
        timeline: [],
        step: 1,
      });
      return;

    case "POOL_CREATED": {
      nextPools[event.pool.id] = { ...event.pool, status: "created" };
      const poolNumber = Number(event.pool.id.match(/\d+/)?.[0] ?? 1) - 1;
      const totalPools = Math.ceil(state.config.populationSize / state.config.groupSize);
      updatePeople(event.pool.personIds, (person, index) => ({
        ...person,
        poolId: event.pool.id,
        status: "pooling",
        target: poolTarget(poolNumber, index, event.pool.personIds.length, totalPools),
      }));
      metrics = { ...metrics, poolsCreated: Object.keys(nextPools).length };
      break;
    }

    case "POOL_TEST_STARTED":
      nextPools[event.poolId] = { ...nextPools[event.poolId], status: "testing" };
      updatePeople(event.personIds, (person) => ({ ...person, status: "testing" }));
      metrics = deriveMetrics(nextPeople, metrics, event.testsUsed);
      break;

    case "POOL_RESULT_NEGATIVE":
      nextPools[event.poolId] = { ...nextPools[event.poolId], status: "negative" };
      updatePeople(event.personIds, (person) => ({ ...person, status: "negative" }));
      metrics = deriveMetrics(nextPeople, { ...metrics, negativePools: metrics.negativePools + 1 }, event.testsUsed);
      break;

    case "POOL_RESULT_POSITIVE":
      nextPools[event.poolId] = { ...nextPools[event.poolId], status: "positive" };
      updatePeople(event.personIds, (person) => ({ ...person, status: "positive-subgroup" }));
      metrics = deriveMetrics(nextPeople, { ...metrics, positivePools: metrics.positivePools + 1 }, event.testsUsed);
      break;

    case "GROUP_SPLIT": {
      // Mark source pool as "split" so its POSITIVE label is removed
      if (nextPools[event.sourcePoolId]) {
        nextPools[event.sourcePoolId] = { ...nextPools[event.sourcePoolId], status: "split" };
      }

      // Use the source pool's geometric grid centre (not member-averaged centroid)
      // so subgroups land in predictable, non-overlapping positions regardless of
      // whether people have drifted or been repositioned by earlier events.
      const totalPools = Math.ceil(state.config.populationSize / state.config.groupSize);
      const poolNum    = parseInt(event.sourcePoolId.match(/pool-(\d+)/)?.[1] ?? "1", 10) - 1;
      const [cx, , cz] = poolCenter(poolNum, totalPools);

      // Subgroups sit ±sepX left/right of the pool centre and RISE_Y above it.
      // sepX is scaled so both subgroup rings always fit inside the parent column
      // without touching the adjacent pool's column.
      const sepX = subgroupSepX(totalPools);
      const sgY  = 0.40 + RISE_Y;   // pool base Y + rise

      event.subgroups.forEach((pool, sgIdx) => {
        nextPools[pool.id] = { ...pool, status: "split" };
        const sgCX = cx + (sgIdx === 0 ? -sepX : +sepX);

        updatePeople(pool.personIds, (person, memberIdx) => {
          const angle = (memberIdx / pool.personIds.length) * Math.PI * 2;
          return {
            ...person,
            subgroupId: pool.id,
            status: "pooling",
            target: [
              sgCX + Math.cos(angle) * SUB_R,
              sgY,
              cz  + Math.sin(angle) * SUB_R,
            ],
          };
        });
      });
      metrics = deriveMetrics(nextPeople, metrics, event.testsUsed);
      break;
    }

    case "SUBGROUP_TEST_STARTED":
      nextPools[event.poolId] = { ...nextPools[event.poolId], status: "testing" };
      updatePeople(event.personIds, (person) => ({ ...person, status: "testing" }));
      metrics = deriveMetrics(nextPeople, metrics, event.testsUsed);
      break;

    case "SUBGROUP_RESULT_NEGATIVE":
      nextPools[event.poolId] = { ...nextPools[event.poolId], status: "negative" };
      updatePeople(event.personIds, (person) => ({ ...person, status: "negative" }));
      metrics = deriveMetrics(nextPeople, { ...metrics, negativePools: metrics.negativePools + 1 }, event.testsUsed);
      break;

    case "SUBGROUP_RESULT_POSITIVE":
      nextPools[event.poolId] = { ...nextPools[event.poolId], status: "positive" };
      updatePeople(event.personIds, (person) => ({ ...person, status: "positive-subgroup" }));
      metrics = deriveMetrics(nextPeople, { ...metrics, positivePools: metrics.positivePools + 1 }, event.testsUsed);
      break;

    case "INDIVIDUAL_TEST_STARTED":
      updatePeople([event.personId], (person) => ({ ...person, status: "testing" }));
      metrics = deriveMetrics(nextPeople, metrics, event.testsUsed);
      break;

    case "INDIVIDUAL_POSITIVE":
      // Keep the person at their current subgroup position — do NOT fly them
      // off-screen.  The "confirmed-infected" status (large pulsing red sphere)
      // makes them unmistakably visible inside their ring next to cleared peers.
      updatePeople([event.personId], (person) => ({
        ...person,
        status: "confirmed-infected",
      }));
      metrics = deriveMetrics(nextPeople, metrics, event.testsUsed);
      break;

    case "INDIVIDUAL_NEGATIVE":
      updatePeople([event.personId], (person) => ({ ...person, status: "negative" }));
      metrics = deriveMetrics(nextPeople, metrics, event.testsUsed);
      break;

    case "METRICS_UPDATED":
    case "SIMULATION_COMPLETE":
      metrics = event.metrics;
      break;

    case "PERSON_INFECTED":
      break;
  }

  const step = state.step + 1;
  const timelinePoint: TimelinePoint = {
    step,
    testsUsed: metrics.testsUsed,
    clearedCount: metrics.clearedCount,
    confirmedInfected: metrics.confirmedInfected,
    efficiency: metrics.efficiency,
  };

  set({
    people: nextPeople,
    pools: nextPools,
    metrics,
    currentEvent: event,
    events: [...state.events.slice(-42), event],
    timeline: [...state.timeline.slice(-50), timelinePoint],
    playbackStatus: event.type === "SIMULATION_COMPLETE" ? "complete" : state.playbackStatus,
    step,
  });
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  config: defaultConfig,
  people: [],
  pools: {},
  metrics: createMetrics(defaultConfig.populationSize),
  timeline: [],
  events: [],
  playbackStatus: "idle",
  step: 0,

  updateConfig: (config) => {
    const nextConfig = { ...get().config, ...config };
    set({
      config: nextConfig,
      metrics: createMetrics(nextConfig.populationSize),
    });
  },

  start: () => {
    clearRunner();
    const config = get().config;
    generator = new PooledTestingEngine(config).run();
    set({
      people: [],
      pools: {},
      metrics: createMetrics(config.populationSize),
      events: [],
      timeline: [],
      currentEvent: undefined,
      playbackStatus: "running",
      step: 0,
    });
    scheduleNext(get, set);
  },

  pause: () => {
    clearRunner();
    set({ playbackStatus: "paused" });
  },

  resume: () => {
    if (!generator) return;
    set({ playbackStatus: "running" });
    scheduleNext(get, set);
  },

  reset: () => {
    clearRunner();
    generator = undefined;
    const config = get().config;
    set({
      people: [],
      pools: {},
      metrics: createMetrics(config.populationSize),
      events: [],
      timeline: [],
      currentEvent: undefined,
      playbackStatus: "idle",
      step: 0,
    });
  },
}));
