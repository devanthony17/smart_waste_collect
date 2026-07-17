import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Brain, AlertTriangle, MapPin, TrendingUp, TrendingDown, Minus, RefreshCw, Layers } from "lucide-react";
import { DashboardLayout } from "../components/layout";
import { StatCard } from "../components/dashboard";
import { analyzeHotspots, AIHotspot, HotspotStats } from "../services/hotspotService";

export default function AIHotspotsPage() {
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<HotspotStats | null>(null);
  const [hotspots, setHotspots] = useState<AIHotspot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHotspots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyzeHotspots();
      setHotspots(data.hotspots);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || t("hotspot_unknown_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  const handleManualAnalysis = async () => {
    setAnalyzing(true);
    // Simulate AI processing time
    setTimeout(async () => {
      await fetchHotspots();
      setAnalyzing(false);
    }, 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "HIGH RISK": return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM RISK": return "bg-amber-100 text-amber-700 border-amber-200";
      case "LOW RISK": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      case "stable": return <Minus className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              {t("hotspot_title", "AI Hotspot Prediction")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t("hotspot_subtitle", "Analyzes waste reports and predicts high-risk areas")}
            </p>
          </div>
          
          <button
            onClick={handleManualAnalysis}
            disabled={analyzing || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} />
            {analyzing ? t("hotspot_analyzing", "AI is analyzing...") : t("hotspot_analyze_btn", "Analyze Hotspots with AI")}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={t("hotspot_stat_risky_areas", "Risky Areas")} 
            value={stats?.riskyAreas ?? "-"} 
            icon={AlertTriangle} 
            iconColor="bg-red-500" 
          />
          <StatCard 
            title={t("hotspot_stat_needs_urgent", "Need urgent action")} 
            value={stats?.needsUrgentAction ?? "-"} 
            icon={MapPin} 
            iconColor="bg-amber-500" 
          />
          <StatCard 
            title={t("hotspot_stat_unresolved", "Unresolved Reports")} 
            value={stats?.unresolved ?? "-"} 
            icon={Layers} 
            iconColor="bg-indigo-500" 
          />
          <StatCard 
            title={t("hotspot_stat_total_reports", "Total Reports Processed")} 
            value={stats?.totalReports ?? "-"} 
            icon={Brain} 
            iconColor="bg-purple-500" 
          />
        </div>

        {/* Hotspots Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("hotspot_results_title", "AI Analysis Results")}
            </h2>
          </div>

          {loading && !analyzing ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : hotspots.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 text-center">
              <Brain className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {t("hotspot_empty_title", "No hotspots detected")}
              </h3>
              <p className="text-sm">
                {t("hotspot_not_enough_data", "Not enough reports for analysis. The system looks healthy.")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Location Area</th>
                    <th className="px-6 py-4 text-center">Density (Reports)</th>
                    <th className="px-6 py-4 text-center">Unresolved</th>
                    <th className="px-6 py-4">Risk Score</th>
                    <th className="px-6 py-4">Trend</th>
                    <th className="px-6 py-4">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {hotspots.map((hotspot) => (
                    <tr key={hotspot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        {hotspot.location}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {hotspot.reportCount}
                      </td>
                      <td className="px-6 py-4 text-center text-red-600 font-bold">
                        {hotspot.unresolvedCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(hotspot.riskScore)}`}>
                          {hotspot.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700">
                           {getTrendIcon(hotspot.trend)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {hotspot.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
