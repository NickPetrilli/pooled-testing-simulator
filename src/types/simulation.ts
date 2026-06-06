export type PersonStatus =
  | "untested"
  | "pooling"
  | "testing"
  | "negative"
  | "positive-subgroup"
  | "confirmed-infected";

export type PoolStatus = "created" | "testing" | "negative" | "positive" | "split";

export interface Person {
  id: number;
  isSick: boolean;
  status: PersonStatus;
  poolId?: string;
  subgroupId?: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface Pool {
  id: string;
  personIds: number[];
  status: PoolStatus;
  level: "pool" | "subgroup";
}

export interface SimulationConfig {
  populationSize: number;
  infectionRate: number;
  groupSize: number;
  speed: number;
}

export interface SimulationMetrics {
  testsUsed: number;
  infectedCount: number;
  confirmedInfected: number;
  clearedCount: number;
  poolsCreated: number;
  positivePools: number;
  negativePools: number;
  individualBaseline: number;
  testsSaved: number;
  efficiency: number;
}

export type SimulationEvent =
  | { type: "POPULATION_GENERATED"; people: Person[]; metrics: SimulationMetrics }
  | { type: "PERSON_INFECTED"; personId: number; infectionCount: number }
  | { type: "POOL_CREATED"; pool: Pool }
  | { type: "POOL_TEST_STARTED"; poolId: string; personIds: number[]; testsUsed: number }
  | { type: "POOL_RESULT_NEGATIVE"; poolId: string; personIds: number[]; testsUsed: number }
  | { type: "POOL_RESULT_POSITIVE"; poolId: string; personIds: number[]; testsUsed: number }
  | { type: "GROUP_SPLIT"; sourcePoolId: string; subgroups: Pool[]; testsUsed: number }
  | { type: "SUBGROUP_TEST_STARTED"; poolId: string; personIds: number[]; testsUsed: number }
  | { type: "SUBGROUP_RESULT_NEGATIVE"; poolId: string; personIds: number[]; testsUsed: number }
  | { type: "SUBGROUP_RESULT_POSITIVE"; poolId: string; personIds: number[]; testsUsed: number }
  | { type: "INDIVIDUAL_TEST_STARTED"; personId: number; poolId: string; testsUsed: number }
  | { type: "INDIVIDUAL_POSITIVE"; personId: number; testsUsed: number }
  | { type: "INDIVIDUAL_NEGATIVE"; personId: number; testsUsed: number }
  | { type: "METRICS_UPDATED"; metrics: SimulationMetrics }
  | { type: "SIMULATION_COMPLETE"; metrics: SimulationMetrics };

export interface TimelinePoint {
  step: number;
  testsUsed: number;
  clearedCount: number;
  confirmedInfected: number;
  efficiency: number;
}
