import type { SimulationEvent } from "../types/simulation";

export function eventDelay(event: SimulationEvent, speed: number) {
  const base = (() => {
    switch (event.type) {
      case "POPULATION_GENERATED":
        return 900;
      case "POOL_CREATED":
      case "GROUP_SPLIT":
        return 760;
      case "POOL_TEST_STARTED":
      case "SUBGROUP_TEST_STARTED":
      case "INDIVIDUAL_TEST_STARTED":
        return 520;
      case "POOL_RESULT_POSITIVE":
      case "SUBGROUP_RESULT_POSITIVE":
      case "INDIVIDUAL_POSITIVE":
        return 720;
      case "POOL_RESULT_NEGATIVE":
      case "SUBGROUP_RESULT_NEGATIVE":
      case "INDIVIDUAL_NEGATIVE":
        return 420;
      case "PERSON_INFECTED":
        return 48;
      default:
        return 340;
    }
  })();

  return Math.max(35, base / Math.max(speed, 0.25));
}
