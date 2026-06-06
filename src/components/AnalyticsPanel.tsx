import { motion } from "framer-motion";
import { Activity, FlaskConical, ShieldCheck, Siren, TestTube2, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSimulationStore } from "../state/simulationStore";

export function AnalyticsPanel() {
  const metrics = useSimulationStore((state) => state.metrics);
  const timeline = useSimulationStore((state) => state.timeline);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="min-h-[560px] rounded-lg border border-emerald-200/15 bg-[#09140f]/72 p-5 shadow-glow backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-100/58">Live Telemetry</p>
          <h2 className="mt-1 text-xl font-semibold">Analytics</h2>
        </div>
        <Activity className="text-bio-mint" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={<TestTube2 size={18} />} label="Tests Used" value={metrics.testsUsed.toLocaleString()} />
        <MetricCard icon={<Siren size={18} />} label="Infected" value={metrics.infectedCount.toLocaleString()} tone="danger" />
        <MetricCard icon={<ShieldCheck size={18} />} label="Cleared" value={metrics.clearedCount.toLocaleString()} />
        <MetricCard icon={<FlaskConical size={18} />} label="Saved" value={metrics.testsSaved.toLocaleString()} tone="amber" />
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.045] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-50/60">Testing Efficiency</p>
            <p className="text-3xl font-semibold text-bio-mint">{metrics.efficiency.toFixed(1)}%</p>
          </div>
          <TrendingUp className="text-bio-mint" />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200"
            animate={{ width: `${Math.min(metrics.efficiency, 100)}%` }}
            transition={{ duration: 0.45 }}
          />
        </div>
      </div>

      <div className="mt-5 h-52 rounded-lg border border-white/10 bg-black/18 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline.length ? timeline : [{ step: 0, testsUsed: 0, efficiency: 100 }]}>
            <defs>
              <linearGradient id="tests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7effc4" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#7effc4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="step" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "rgba(4, 14, 10, 0.92)",
                border: "1px solid rgba(126, 255, 196, 0.2)",
                borderRadius: 8,
              }}
            />
            <Area type="monotone" dataKey="testsUsed" stroke="#7effc4" fill="url(#tests)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.aside>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "mint" | "amber" | "danger";
}

function MetricCard({ icon, label, value, tone = "mint" }: MetricCardProps) {
  const color = tone === "danger" ? "text-red-300" : tone === "amber" ? "text-amber-200" : "text-bio-mint";
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/45">{label}</p>
      <p className="mt-1 font-mono text-xl text-white">{value}</p>
    </div>
  );
}
