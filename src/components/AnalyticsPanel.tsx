import { motion } from "framer-motion";
import { Activity, FlaskConical, ShieldCheck, Siren, TestTube2, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSimulationStore } from "../state/simulationStore";

export function AnalyticsPanel() {
  const metrics  = useSimulationStore((state) => state.metrics);
  const timeline = useSimulationStore((state) => state.timeline);

  const chartData = timeline.length
    ? timeline
    : [{ step: 0, testsUsed: 0, efficiency: 100 }];

  return (
    <aside className="flex h-full flex-col gap-4 rounded-xl border border-white/8 bg-black/40 p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">Live Telemetry</p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-white">Analytics</h2>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-bio-mint/14 bg-bio-mint/6">
          <Activity size={15} className="text-bio-mint" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={<TestTube2 size={15} />}   label="Tests Used"      value={metrics.testsUsed.toLocaleString()} />
        <MetricCard icon={<Siren size={15} />}        label="Infected"        value={metrics.infectedCount.toLocaleString()} tone="danger" />
        <MetricCard icon={<ShieldCheck size={15} />}  label="Cleared"         value={metrics.clearedCount.toLocaleString()} tone="mint" />
        <MetricCard
          icon={<FlaskConical size={15} />}
          label="Tests Saved"
          value={metrics.testsSaved.toLocaleString()}
          tone="amber"
          subtitle={`vs. ${metrics.individualBaseline.toLocaleString()} individual`}
        />
      </div>

      {/* Patients tested — full-width progress bar card */}
      <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/45">
            <Activity size={13} />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Patients Tested</span>
          </div>
          <span className="font-mono text-sm font-semibold text-white">
            {(metrics.clearedCount + metrics.confirmedInfected).toLocaleString()}
            <span className="text-white/30"> / {metrics.individualBaseline.toLocaleString()}</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-white/40 to-white/60"
            animate={{
              width: metrics.individualBaseline > 0
                ? `${Math.min(((metrics.clearedCount + metrics.confirmedInfected) / metrics.individualBaseline) * 100, 100)}%`
                : "0%",
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Efficiency meter */}
      <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Testing Efficiency</p>
            <p className="mt-0.5 font-mono text-3xl font-bold leading-none text-bio-mint">
              {metrics.efficiency.toFixed(1)}
              <span className="ml-0.5 text-base font-normal text-bio-mint/50">%</span>
            </p>
          </div>
          <TrendingUp size={16} className="mt-1 text-bio-mint/40" />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-bio-mint to-cyan-300"
            animate={{ width: `${Math.min(metrics.efficiency, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-white/18">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/8 bg-black/25 p-3">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/28">
          Tests Over Time
        </p>
        <div className="flex-1" style={{ minHeight: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
              <defs>
                <linearGradient id="gradMint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7effc4" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#7effc4" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "rgba(4, 9, 12, 0.96)",
                  border: "1px solid rgba(126, 255, 196, 0.14)",
                  borderRadius: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#7effc4",
                }}
                labelStyle={{ color: "rgba(126,255,196,0.45)", fontSize: 9, letterSpacing: "0.1em" }}
                itemStyle={{ color: "#7effc4" }}
              />
              <Area
                type="monotone"
                dataKey="testsUsed"
                stroke="#7effc4"
                strokeWidth={1.5}
                fill="url(#gradMint)"
                dot={false}
                activeDot={{ r: 3, fill: "#7effc4", stroke: "rgba(126,255,196,0.3)", strokeWidth: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </aside>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "mint" | "amber" | "danger";
  subtitle?: string;
}

function MetricCard({ icon, label, value, tone = "mint", subtitle }: MetricCardProps) {
  const styles = {
    mint:   { border: "border-white/8",        icon: "text-bio-mint",  value: "text-white"      },
    danger: { border: "border-red-400/12",     icon: "text-red-400",   value: "text-red-200"    },
    amber:  { border: "border-amber-400/12",   icon: "text-amber-300", value: "text-amber-100"  },
  }[tone];

  return (
    <div className={`rounded-lg border ${styles.border} bg-white/[0.03] p-3 transition-colors duration-200 hover:bg-white/[0.06]`}>
      <div className={`mb-2 ${styles.icon}`}>{icon}</div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/32">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-semibold leading-none ${styles.value}`}>{value}</p>
      {subtitle && (
        <p className="mt-1 font-mono text-[8px] text-white/22">{subtitle}</p>
      )}
    </div>
  );
}
