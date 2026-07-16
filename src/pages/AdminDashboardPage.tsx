import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Truck,
  FileText,
  DollarSign,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { DashboardLayout } from "../components/layout";
import { StatCard } from "../components/dashboard";
import { useAuth } from "../hooks/useAuth";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    users: 12,
    reports: 8,
    vehicles: 4,
    revenue: 2450000,
  });
  const [messages, setMessages] = useState([
    {
      id: "demo-1",
      name: "Amina Hassan",
      email: "amina@example.com",
      message: "Please improve collection on Nyerere Road.",
      created_at: new Date().toISOString(),
    },
  ]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStats((prev) => ({
        users: prev.users + (Math.random() > 0.6 ? 1 : 0),
        reports: Math.max(1, prev.reports + (Math.random() > 0.5 ? 1 : -1)),
        vehicles: prev.vehicles + (Math.random() > 0.75 ? 1 : 0),
        revenue: prev.revenue + (Math.random() > 0.5 ? 1800 : 2400),
      }));

      setMessages((prev) => {
        const locations = ["Nyerere Road", "Kawawa", "Kinondoni", "Mbezi"]; 
        const nextMessage = {
          id: `live-${Date.now()}`,
          name: "Live Ops",
          email: "ops@example.com",
          message: `New pickup activity detected near ${locations[Math.floor(Math.random() * locations.length)]}.`,
          created_at: new Date().toISOString(),
        };

        return [nextMessage, ...prev].slice(0, 4);
      });

      setLastUpdated(new Date());
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            {t('admin_dashboard_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('admin_dashboard_subtitle')}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5" />
              Welcome back, {user?.first_name || user?.email || "Admin"}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 font-medium text-white">
                <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white" />
                Live
              </span>
              <span>Updated {lastUpdated.toLocaleTimeString("en-GH", { hour: "numeric", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>
          <p className="mt-1 text-sm">
            The dashboard is now refreshing automatically with live-style updates while Supabase is not configured.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title={t('admin_stat_users')}
            value={stats.users}
            icon={Users}
            iconColor="bg-blue-500"
          />
          <StatCard
            title={t('admin_stat_reports')}
            value={stats.reports}
            icon={FileText}
            iconColor="bg-orange-500"
          />
          <StatCard
            title={t('admin_stat_vehicles')}
            value={stats.vehicles}
            icon={Truck}
            iconColor="bg-green-500"
          />
          <StatCard
            title={t('admin_stat_revenue')}
            value={`GHS ${stats.revenue.toLocaleString("en-GH")}`}
            icon={DollarSign}
            iconColor="bg-emerald-500"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t('admin_contact_messages')}
            </h2>
            <span className="text-sm px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium">
              {messages.length}
            </span>
          </div>

          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-secondary-900 dark:text-white">{msg.name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(msg.created_at).toLocaleString("sw-TZ")}
                  </span>
                </div>
                <a href={`mailto:${msg.email}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  {msg.email}
                </a>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
