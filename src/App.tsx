import { AnimatePresence, motion } from "framer-motion";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { ControlPanel } from "./components/ControlPanel";
import { EventTimeline } from "./components/EventTimeline";
import { SimulationHUD } from "./components/SimulationHUD";
import { SimulationScene } from "./three/SimulationScene";
import { useSimulationStore } from "./state/simulationStore";

const PHASE_BANNERS: Partial<Record<string, { text: string; color: string }>> = {
  POOL_RESULT_POSITIVE:     { text: "POSITIVE POOL DETECTED — SPLITTING INTO 2 GROUPS OF 4", color: "#ff4b4b" },
  GROUP_SPLIT:              { text: "SPLITTING → 2 SUBGROUPS OF 4 FOR TARGETED TESTING",     color: "#ff8c42" },
  SUBGROUP_RESULT_POSITIVE: { text: "SUBGROUP POSITIVE — INDIVIDUAL TESTING REQUIRED",        color: "#ff4b4b" },
  SIMULATION_COMPLETE:      { text: "SIMULATION COMPLETE",                                    color: "#7effc4" },
};

// Color for the top event-type toast pill — red for positive detections, mint otherwise
const EVENT_TOAST_COLOR: Partial<Record<string, string>> = {
  POOL_RESULT_POSITIVE:     "#ff4b4b",
  SUBGROUP_RESULT_POSITIVE: "#ff4b4b",
  INDIVIDUAL_POSITIVE:      "#ff4b4b",
  GROUP_SPLIT:              "#ff8c42",
};
const TOAST_COLOR_FALLBACK = "#7effc4";

const STATUS_CONFIG = {
  idle:     { label: "awaiting launch",   dotClass: "bg-emerald-400/30", textClass: "text-emerald-400/50", ping: false },
  running:  { label: "simulation active", dotClass: "bg-bio-mint",       textClass: "text-bio-mint",       ping: true  },
  paused:   { label: "paused",            dotClass: "bg-amber-300",      textClass: "text-amber-300",      ping: false },
  complete: { label: "complete",          dotClass: "bg-cyan-300",       textClass: "text-cyan-300",       ping: false },
} as const;

const PANEL_TRANSITION = { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const };

export function App() {
  const playbackStatus = useSimulationStore((state) => state.playbackStatus);
  const currentEvent   = useSimulationStore((state) => state.currentEvent);

  const status     = STATUS_CONFIG[playbackStatus] ?? STATUS_CONFIG.idle;
  const isActive   = playbackStatus !== "idle";
  const toastColor = currentEvent
    ? (EVENT_TOAST_COLOR[currentEvent.type] ?? TOAST_COLOR_FALLBACK)
    : TOAST_COLOR_FALLBACK;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04090c] text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_0%,rgba(20,185,129,0.10),transparent),radial-gradient(ellipse_50%_40%_at_85%_0%,rgba(89,184,255,0.07),transparent)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(126,255,196,1)_1px,transparent_1px),linear-gradient(90deg,rgba(126,255,196,1)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(4,9,12,0.65)_100%)]" />

      {/* Main layout — flex so side panels collapse cleanly */}
      <section className="relative z-10 flex min-h-screen items-stretch gap-4 p-4">

        {/* ── Left panel — slides out when simulation starts ── */}
        <AnimatePresence initial={false}>
          {!isActive && (
            <motion.div
              key="left-panel"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={PANEL_TRANSITION}
              className="w-[360px] flex-shrink-0"
            >
              <ControlPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Center — expands via layout animation ── */}
        <motion.div
          layout
          transition={PANEL_TRANSITION}
          className="relative flex min-h-[560px] flex-1 overflow-hidden rounded-xl border border-white/8 bg-black/35 backdrop-blur-xl"
        >
          {/* Sci-fi corner brackets */}
          <div className="pointer-events-none absolute left-3 top-3 h-8 w-8 border-l-2 border-t-2 border-bio-mint/30" />
          <div className="pointer-events-none absolute right-3 top-3 h-8 w-8 border-r-2 border-t-2 border-bio-mint/30" />
          <div className="pointer-events-none absolute bottom-[68px] left-3 h-8 w-8 border-b-2 border-l-2 border-bio-mint/15" />
          <div className="pointer-events-none absolute bottom-[68px] right-3 h-8 w-8 border-b-2 border-r-2 border-bio-mint/15" />

          {/* Status dot — top left */}
          <div className="absolute left-5 top-5 z-20 flex items-center gap-2.5">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              {status.ping && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bio-mint opacity-55" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dotClass}`} />
            </span>
            <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${status.textClass}`}>
              {status.label}
            </p>
          </div>

          {/* HUD overlays (analytics card + glass control buttons) — active only */}
          <AnimatePresence>
            {isActive && <SimulationHUD key="hud" />}
          </AnimatePresence>

          {/* Event timeline — always visible at bottom */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <EventTimeline />
          </div>

          {/* 3-D scene fills the panel */}
          <SimulationScene />
        </motion.div>

        {/* ── Right panel — slides out when simulation starts ── */}
        <AnimatePresence initial={false}>
          {!isActive && (
            <motion.div
              key="right-panel"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={PANEL_TRANSITION}
              className="w-[340px] flex-shrink-0"
            >
              <AnalyticsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Floating current-event toast — active only */}
      <motion.div
        key={currentEvent?.type ?? "none"}
        initial={{ opacity: 0, y: -10, x: "-50%" }}
        animate={{ opacity: currentEvent && isActive ? 1 : 0, y: 0, x: "-50%" }}
        transition={{ duration: 0.18 }}
        className="pointer-events-none fixed left-1/2 top-4 z-30 hidden items-center gap-2 rounded-full bg-black/70 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] backdrop-blur-md md:flex"
        style={{
          color:  toastColor,
          border: `1px solid ${toastColor}25`,
        }}
      >
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full"
          style={{ backgroundColor: toastColor }}
        />
        {currentEvent?.type.replaceAll("_", " ")}
      </motion.div>

      {/* Phase banner — prominent alert for the key split moments */}
      <AnimatePresence>
        {isActive && currentEvent && PHASE_BANNERS[currentEvent.type] && (
          <motion.div
            key={currentEvent.type}
            initial={{ opacity: 0, scale: 0.92, y: 12, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.96, y: -8, x: "-50%" }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-30"
          >
            <div
              className="flex items-center gap-3 rounded-lg border px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.18em] backdrop-blur-md"
              style={{
                color:           PHASE_BANNERS[currentEvent.type]!.color,
                borderColor:     PHASE_BANNERS[currentEvent.type]!.color + "55",
                backgroundColor: PHASE_BANNERS[currentEvent.type]!.color + "12",
                boxShadow:       `0 0 24px ${PHASE_BANNERS[currentEvent.type]!.color}30`,
              }}
            >
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: PHASE_BANNERS[currentEvent.type]!.color }}
              />
              {PHASE_BANNERS[currentEvent.type]!.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
