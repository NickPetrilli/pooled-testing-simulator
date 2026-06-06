import { AnimatePresence, motion } from "framer-motion";
import { useSimulationStore } from "../state/simulationStore";

export function EventTimeline() {
  const events = useSimulationStore((state) => state.events.slice(-5));

  return (
    <div className="flex min-h-14 items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-black/38 p-2 backdrop-blur-md">
      <AnimatePresence initial={false}>
        {events.map((event, index) => (
          <motion.div
            key={`${event.type}-${index}-${"testsUsed" in event ? event.testsUsed : index}`}
            initial={{ opacity: 0, x: 26, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.94 }}
            className="min-w-fit rounded-md border border-emerald-200/15 bg-emerald-200/8 px-3 py-2"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-50/78">
              {event.type.replaceAll("_", " ")}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
