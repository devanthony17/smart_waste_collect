import { useMemo } from "react";
import { Recycle, Leaf, Boxes, TrendingUp } from "lucide-react";
import { DashboardLayout } from "../components/layout";

export default function RecyclingPage() {
  const stats = useMemo(
    () => [
      { label: "Collected Recyclables", value: "1,840 kg", icon: Boxes },
      { label: "Recycling Rate", value: "72%", icon: TrendingUp },
      { label: "Eco Impact", value: "+18%", icon: Leaf },
    ],
    []
  );

  const items = useMemo(
    () => [
      { name: "Plastic Bottles", quantity: "640 kg", status: "Ready for pickup" },
      { name: "Paper & Cardboard", quantity: "510 kg", status: "Sorted" },
      { name: "Glass", quantity: "390 kg", status: "Processing" },
      { name: "Metal", quantity: "300 kg", status: "Collected" },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Recycling</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of recyclable material processing and environmental impact.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <stat.icon className="h-5 w-5 text-emerald-500" />
                <span className="text-sm">{stat.label}</span>
              </div>
              <div className="mt-3 text-2xl font-semibold text-secondary-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-lg font-semibold text-secondary-900 dark:text-white">
            <Recycle className="h-5 w-5 text-emerald-500" />
            Recycling Inventory
          </div>

          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{item.quantity}</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
