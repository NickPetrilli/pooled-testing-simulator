import type { PersonStatus } from "../types/simulation";

export const statusColors: Record<PersonStatus, string> = {
  untested: "#4a5c54",
  pooling: "#59b8ff",
  testing: "#ffd166",
  negative: "#7effc4",
  "positive-subgroup": "#ff4b4b",
  "confirmed-infected": "#ff1a1a",
};
