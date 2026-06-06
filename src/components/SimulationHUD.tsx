import { motion } from "framer-motion";
import { Activity, ArrowLeft, FlaskConical, Pause, Play, RotateCcw, ShieldCheck, Siren, Square, TestTube2, TrendingUp } from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";

export function SimulationHUD() {
  const { metrics, playbackStatus, pause, resume, reset, start } = useSimulationStore();

  const isPaused    = playbackStatus === "paused";
  const isComplete  = playbackStatus === "complete";

  return (
    <>
      {/* ── Top-right analytics overlay ── */}
      <motion.div
        initial={{ opacity: 0, x: 16, y: -8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute right-4 top-4 z-20 w-56 rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl"
      >
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-white/28">
          Live Stats
        </p>

        <div className="space-y-2">
          <HudStat icon={<TestTube2 size={12} />}   label="Tests Used"      value={metrics.testsUsed} />
          <HudStat icon={<Siren size={12} />}        label="Infected"        value={metrics.infectedCount}  color="text-red-300" />
          <HudStat icon={<ShieldCheck size={12} />}  label="Cleared"         value={metrics.clearedCount}   color="text-bio-mint" />
          <HudStat icon={<FlaskConical size={12} />} label="Tests Saved"     value={metrics.testsSaved}     color="text-amber-300" />
          <HudStat icon={<Activity size={12} />}     label="Patients Tested" value={metrics.clearedCount + metrics.confirmedInfected} color="text-white/70" />
        </div>

        <div className="mt-3 border-t border-white/8 pt-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">Efficiency</p>
            <TrendingUp size={11} className="text-bio-mint/40" />
          </div>
          <p className="font-mono text-2xl font-bold leading-none text-bio-mint">
            {metrics.efficiency.toFixed(1)}
            <span className="ml-0.5 text-sm font-normal text-bio-mint/45">%</span>
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-bio-mint"
              animate={{ width: `${Math.min(metrics.efficiency, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Bottom-center glass control buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="absolute bottom-[72px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-3"
      >
        {isComplete ? (
          <>
            <GlassButton
              onClick={reset}
              icon={<ArrowLeft size={15} />}
              label="Edit Parameters"
              tone="neutral"
            />
            <GlassButton
              onClick={start}
              icon={<RotateCcw size={15} />}
              label="Run Again"
              tone="mint"
            />
          </>
        ) : (
          <>
            <GlassButton
              onClick={isPaused ? resume : pause}
              icon={isPaused ? <Play size={15} /> : <Pause size={15} />}
              label={isPaused ? "Resume" : "Pause"}
              tone="neutral"
            />
            <GlassButton
              onClick={reset}
              icon={<Square size={14} />}
              label="Stop"
              tone="danger"
            />
          </>
        )}
      </motion.div>
    </>
  );
}

/* ── Sub-components ── */

interface HudStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}

function HudStat({ icon, label, value, color = "text-white/80" }: HudStatProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-white/35">
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <span className={`font-mono text-sm font-semibold tabular-nums ${color}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

interface GlassButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone: "neutral" | "mint" | "danger";
}

function GlassButton({ onClick, icon, label, tone }: GlassButtonProps) {
  const styles = {
    neutral: "border-white/14 bg-white/8   text-white/75   hover:border-white/26 hover:bg-white/14 hover:text-white",
    mint:    "border-bio-mint/25 bg-bio-mint/10 text-bio-mint  hover:border-bio-mint/45 hover:bg-bio-mint/18",
    danger:  "border-red-400/20 bg-red-400/8  text-red-300/80 hover:border-red-400/38 hover:bg-red-400/14 hover:text-red-200",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-6 font-mono text-[11px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-200 ${styles}`}
    >
      {icon}
      {label}
    </button>
  );
}
