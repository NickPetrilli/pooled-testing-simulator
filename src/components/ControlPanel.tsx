import { Lock, Pause, Play, RotateCcw, ScanLine, StepForward } from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";

export function ControlPanel() {
  const { config, playbackStatus, updateConfig, start, pause, resume, reset } = useSimulationStore();
  const isLocked   = playbackStatus === "running" || playbackStatus === "paused";
  const isInactive = playbackStatus === "idle" || playbackStatus === "complete";

  return (
    <aside className="flex h-full flex-col justify-between rounded-xl border border-white/8 bg-black/40 p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="space-y-5">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/14 bg-emerald-400/6 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-300/60">
            <ScanLine size={11} />
            BioScan Engine
          </div>
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-white">
            Pooled Testing
            <br />
            <span className="text-bio-mint">Simulator</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/40">
            Event-driven COVID-19 pooled testing visualized as a real-time cinematic simulation.
          </p>
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">
            {isLocked && <Lock size={8} />}
            {isLocked ? "config locked" : "configuration"}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Sliders */}
        <div className="space-y-2.5">
          <ControlRange
            label="Population"
            value={config.populationSize}
            min={16}
            max={2048}
            step={8}
            suffix=" people"
            disabled={isLocked}
            onChange={(populationSize) => updateConfig({ populationSize })}
          />
          <ControlRange
            label="Infection Rate"
            value={config.infectionRate}
            min={0}
            max={30}
            step={1}
            suffix="%"
            disabled={isLocked}
            accent="danger"
            onChange={(infectionRate) => updateConfig({ infectionRate })}
          />
          <ControlRange
            label="Playback Speed"
            value={config.speed}
            min={0.5}
            max={10}
            step={0.5}
            suffix="×"
            accent="amber"
            onChange={(speed) => updateConfig({ speed })}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2.5">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Start button */}
        <button
          onClick={start}
          className="btn-shimmer group relative flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-400 to-bio-mint text-sm font-semibold uppercase tracking-[0.2em] text-emerald-950 shadow-glow transition-all duration-200 hover:shadow-[0_0_48px_rgba(126,255,196,0.5)]"
        >
          <Play size={15} className="transition-transform duration-150 group-hover:scale-110" />
          Run Simulation
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={playbackStatus === "paused" ? resume : pause}
            disabled={isInactive}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-28"
          >
            {playbackStatus === "paused" ? <StepForward size={14} /> : <Pause size={14} />}
            {playbackStatus === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            onClick={reset}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-400/14 bg-amber-400/5 text-sm text-amber-200/70 transition-all duration-200 hover:border-amber-400/28 hover:bg-amber-400/10 hover:text-amber-100"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

interface ControlRangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  disabled?: boolean;
  accent?: "mint" | "danger" | "amber";
  onChange: (value: number) => void;
}

function ControlRange({
  label, value, min, max, step, suffix, disabled, accent = "mint", onChange,
}: ControlRangeProps) {
  const valueColor = accent === "danger" ? "text-red-300" : accent === "amber" ? "text-amber-300" : "text-bio-mint";

  return (
    <div
      className={`rounded-lg border p-3.5 transition-all duration-200 ${
        disabled
          ? "border-white/5 bg-white/[0.02] opacity-45"
          : "border-white/8 bg-white/[0.03] hover:border-white/14"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
          {label}
        </span>
        <span className={`font-mono text-sm font-semibold ${valueColor}`}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-white/18">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
