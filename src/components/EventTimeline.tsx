import { AnimatePresence, motion } from "framer-motion";
import { useSimulationStore } from "../state/simulationStore";

type EventCategory = "positive" | "negative" | "started" | "created" | "complete" | "default";

function categorize(type: string): EventCategory {
  const t = type.toLowerCase();
  if (t.includes("positive") || t.includes("confirmed")) return "positive";
  if (t.includes("negative") || t.includes("cleared"))   return "negative";
  if (t.includes("complete"))                             return "complete";
  if (t.includes("started"))                             return "started";
  if (t.includes("created") || t.includes("split") || t.includes("generated")) return "created";
  return "default";
}

const STYLES: Record<EventCategory, { border: string; bg: string; dot: string; text: string }> = {
  positive: { border: "border-red-400/20",     bg: "bg-red-400/8",     dot: "bg-red-400",    text: "text-red-300/80"     },
  negative: { border: "border-emerald-400/20", bg: "bg-emerald-400/8", dot: "bg-bio-mint",   text: "text-emerald-300/80" },
  started:  { border: "border-blue-400/20",    bg: "bg-blue-400/8",    dot: "bg-blue-400",   text: "text-blue-300/80"    },
  created:  { border: "border-cyan-400/20",    bg: "bg-cyan-400/8",    dot: "bg-cyan-400",   text: "text-cyan-300/80"    },
  complete: { border: "border-amber-400/22",   bg: "bg-amber-400/8",   dot: "bg-amber-300",  text: "text-amber-200/80"   },
  default:  { border: "border-white/10",       bg: "bg-white/5",       dot: "bg-white/40",   text: "text-white/55"       },
};

export function EventTimeline() {
  const allEvents = useSimulationStore((state) => state.events);
  const events = allEvents.slice(-5);

  return (
    <div className="flex min-h-11 items-center gap-2 overflow-hidden rounded-lg border border-white/8 bg-black/55 px-3 py-2 backdrop-blur-md">
      <AnimatePresence initial={false}>
        {events.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/20"
          >
            Awaiting events…
          </motion.p>
        ) : (
          events.map((event, index) => {
            const cat    = categorize(event.type);
            const styles = STYLES[cat];
            return (
              <motion.div
                key={`${event.type}-${index}-${"testsUsed" in event ? event.testsUsed : index}`}
                initial={{ opacity: 0, x: 28, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.88 }}
                transition={{ duration: 0.18 }}
                className={`flex min-w-fit items-center gap-1.5 rounded border ${styles.border} ${styles.bg} px-2.5 py-1.5`}
              >
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${styles.dot}`} />
                <p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${styles.text}`}>
                  {event.type.replaceAll("_", " ")}
                </p>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}
