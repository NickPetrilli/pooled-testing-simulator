import { motion } from "framer-motion";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { ControlPanel } from "./components/ControlPanel";
import { EventTimeline } from "./components/EventTimeline";
import { SimulationScene } from "./three/SimulationScene";
import { useSimulationStore } from "./state/simulationStore";

export function App() {
  const playbackStatus = useSimulationStore((state) => state.playbackStatus);
  const currentEvent = useSimulationStore((state) => state.currentEvent);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06100d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(20,185,129,0.18),transparent_28%),radial-gradient(circle_at_78%_4%,rgba(90,180,255,0.13),transparent_24%),linear-gradient(135deg,rgba(8,16,13,0.96),rgba(18,27,22,0.9)_45%,rgba(33,27,20,0.88))]" />
      <div className="absolute inset-0 opacity-[0.17] [background-image:linear-gradient(rgba(126,255,196,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(126,255,196,0.14)_1px,transparent_1px)] [background-size:54px_54px]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)_340px] lg:p-5">
        <ControlPanel />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative min-h-[560px] overflow-hidden rounded-lg border border-emerald-200/15 bg-black/20 shadow-glow backdrop-blur-xl"
        >
          <div className="absolute left-5 top-5 z-20 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-bio-mint shadow-[0_0_18px_rgba(126,255,196,0.9)]" />
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-100/80">
              {playbackStatus === "idle" ? "awaiting launch" : playbackStatus}
            </p>
          </div>
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <EventTimeline />
          </div>
          <SimulationScene />
        </motion.div>

        <AnalyticsPanel />
      </section>

      <motion.div
        key={currentEvent?.type ?? "none"}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: currentEvent ? 1 : 0, y: 0 }}
        className="pointer-events-none fixed left-1/2 top-5 z-30 hidden -translate-x-1/2 rounded-full border border-emerald-200/20 bg-emerald-950/55 px-5 py-2 font-mono text-xs uppercase tracking-[0.22em] text-emerald-100 shadow-glow backdrop-blur-md md:block"
      >
        {currentEvent?.type.replaceAll("_", " ")}
      </motion.div>
    </main>
  );
}
