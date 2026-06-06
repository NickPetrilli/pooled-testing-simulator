import type { Person, SimulationMetrics } from "../types/simulation";

export function createMetrics(populationSize: number, infectedCount = 0): SimulationMetrics {
  return {
    testsUsed: 0,
    infectedCount,
    confirmedInfected: 0,
    clearedCount: 0,
    poolsCreated: 0,
    positivePools: 0,
    negativePools: 0,
    individualBaseline: populationSize,
    testsSaved: populationSize,
    efficiency: 100,
  };
}

export function deriveMetrics(
  people: Person[],
  metrics: SimulationMetrics,
  testsUsed: number,
): SimulationMetrics {
  const clearedCount = people.filter((person) => person.status === "negative").length;
  const confirmedInfected = people.filter((person) => person.status === "confirmed-infected").length;
  const testsSaved = Math.max(metrics.individualBaseline - testsUsed, 0);
  const efficiency = metrics.individualBaseline === 0 ? 0 : (testsSaved / metrics.individualBaseline) * 100;

  return {
    ...metrics,
    testsUsed,
    clearedCount,
    confirmedInfected,
    testsSaved,
    efficiency,
  };
}
