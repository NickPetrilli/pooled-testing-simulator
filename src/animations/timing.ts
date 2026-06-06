import type { SimulationEvent } from "../types/simulation";

export function eventDelay(event: SimulationEvent, speed: number) {
  const base = (() => {
    switch (event.type) {
      case "POPULATION_GENERATED":
        return 900;
      case "POOL_CREATED":
        return 680;
      // Linger on positive results so the viewer can register them before the split
      case "POOL_RESULT_POSITIVE":
      case "SUBGROUP_RESULT_POSITIVE":
        return 1400;
      case "GROUP_SPLIT":
        return 1100;
      case "POOL_TEST_STARTED":
      case "SUBGROUP_TEST_STARTED":
      case "INDIVIDUAL_TEST_STARTED":
        return 480;
      case "POOL_RESULT_NEGATIVE":
      case "SUBGROUP_RESULT_NEGATIVE":
        return 360;
      case "INDIVIDUAL_POSITIVE":
        return 640;
      case "INDIVIDUAL_NEGATIVE":
        return 340;
      case "PERSON_INFECTED":
        return 48;
      default:
        return 300;
    }
  })();

  return Math.max(35, base / Math.max(speed, 0.25));
}
