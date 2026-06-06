import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, ScanLine, StepForward } from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";

export function ControlPanel() {
  const { config, playbackStatus, updateConfig, start, pause, resume, reset } = useSimulationStore();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="flex min-h-[560px] flex-col justify-between rounded-lg border border-emerald-200/15 bg-[#07130f]/72 p-5 shadow-glow backdrop-blur-xl"
    >
      <div className="space-y-6">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-300/8 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100/75">
            <ScanLine size={14} />
            BioScan Engine
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-white">Pooled Testing Simulator</h1>
          <p className="mt-3 text-sm leading-6 text-emerald-50/68">
            Event-driven COVID-19 pooled testing, reimagined as a real-time cinematic TypeScript simulation.
          </p>
        </div>

        <ControlRange
          label="Population"
          value={config.populationSize}
          min={16}
          max={512}
          step={8}
          suffix="people"
          onChange={(populationSize) => updateConfig({ populationSize })}
          disabled={playbackStatus === "running" || playbackStatus === "paused"}
        />
        <ControlRange
          label="Infection Rate"
          value={config.infectionRate}
          min={0}
          max={30}
          step={1}
          suffix="%"
          onChange={(infectionRate) => updateConfig({ infectionRate })}
          disabled={playbackStatus === "running" || playbackStatus === "paused"}
        />
        <ControlRange
          label="Playback Speed"
          value={config.speed}
          min={0.5}
          max={5}
          step={0.1}
          suffix="x"
          onChange={(speed) => updateConfig({ speed })}
        />
      </div>

      <div className="space-y-3">
        <button
          onClick={start}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-300 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-950 shadow-glow transition hover:bg-bio-mint"
        >
          <Play size={17} className="transition group-hover:scale-110" />
          Start
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={playbackStatus === "paused" ? resume : pause}
            disabled={playbackStatus === "idle" || playbackStatus === "complete"}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-emerald-200/15 bg-white/7 text-sm text-emerald-50 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {playbackStatus === "paused" ? <StepForward size={16} /> : <Pause size={16} />}
            {playbackStatus === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            onClick={reset}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-amber-200/20 bg-amber-200/8 text-sm text-amber-50 transition hover:bg-amber-200/14"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </motion.aside>
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
  onChange: (value: number) => void;
}

function ControlRange({ label, value, min, max, step, suffix, disabled, onChange }: ControlRangeProps) {
  return (
    <label className="block rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-emerald-50/80">{label}</span>
        <span className="font-mono text-sm text-bio-mint">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-emerald-300 disabled:opacity-40"
      />
    </label>
  );
}
