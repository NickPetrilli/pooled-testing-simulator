import type { PersonStatus } from "../types/simulation";

export const statusColors: Record<PersonStatus, string> = {
  untested: "#6c7d74",
  pooling: "#59b8ff",
  testing: "#ffd166",
  negative: "#7effc4",
  "positive-subgroup": "#ff9f43",
  "confirmed-infected": "#ff4b4b",
};
