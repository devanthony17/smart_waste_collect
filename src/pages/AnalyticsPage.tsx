import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { DashboardLayout } from "../components/layout";
import { StatCard } from "../components/dashboard";
import { AreaChartCard, BarChartCard, PieChartCard, LineChartCard } from "../components/dashboard/Charts";

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const stats = useMemo(
    () => [
      { title: "Total Collections", value: "1,248", icon: BarChart3, iconColor: "bg-emerald-500" },
      { title: "Resolved Reports", value: "96%", icon: TrendingUp, iconColor: "bg-sky-500" },
      { title: "Critical Hotspots", value: "14", icon: AlertTriangle, iconColor: "bg-amber-500" },
      { title: "Revenue", value: "GHS 2,450,000", icon: DollarSign, iconColor: "bg-violet-500" },
    ],
    []
  );

  const monthlyData = [
    { name: "Jan", value: 120 },
    { name: "Feb", value: 145 },
    { name: "Mar", value: 168 },
    { name: "Apr", value: 182 },
    { name: "May", value: 210 },
    { name: "Jun", value: 238 },
  ];

  const wasteMix = [
    { name: "Organic", value: 42 },
    { name: "Plastic", value: 28 },
    { name: "Paper", value: 15 },
    { name: "Glass", value: 10 },
    { name: "Metal", value: 5 },
  ];

  const performanceData = [
    { name: "Mon", actual: 72, target: 78 },
    { name: "Tue", actual: 81, target: 80 },
    { name: "Wed", actual: 76, target: 82 },
    { name: "Thu", actual: 88, target: 85 },
    { name: "Fri", actual: 91, target: 88 },
    { name: "Sat", actual: 95, target: 90 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Performance overview for waste collection and service delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} iconColor={stat.iconColor} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AreaChartCard title="Monthly Collection Volume" data={monthlyData} />
          <LineChartCard
            title="Daily Performance vs Target"
            data={performanceData}
            lines={[
              { dataKey: "actual", stroke: "#10b981", name: "Actual" },
              { dataKey: "target", stroke: "#0ea5e9", name: "Target" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <BarChartCard title="Weekly Pickup Efficiency" data={monthlyData.map((item) => ({ name: item.name, value: item.value }))} />
          </div>
          <PieChartCard title="Waste Composition" data={wasteMix} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-lg font-semibold text-secondary-900 dark:text-white">
            <Activity className="h-5 w-5 text-emerald-500" />
            Operational Summary
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This demo analytics view highlights service throughput, hotspot pressure, and revenue trends using local sample data.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
