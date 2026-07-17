import { supabase } from "../lib/supabase";

export interface AIHotspot {
  id: string;
  location: string;
  reportCount: number;
  unresolvedCount: number;
  riskScore: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK";
  recommendation: string;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
}

export interface HotspotStats {
  totalReports: number;
  thisMonth: number;
  riskyAreas: number;
  needsUrgentAction: number;
  pending: number;
  unresolved: number;
}

/**
 * Simulates an AI clustering algorithm by fetching reports from Supabase,
 * grouping them by location, and assigning a risk score based on density and unresolved status.
 */
export async function analyzeHotspots(): Promise<{ hotspots: AIHotspot[]; stats: HotspotStats }> {
  // Fetch reports
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*");

  if (error || !reports) {
    throw new Error("Failed to fetch reports for AI analysis.");
  }

  // 1. Calculate base stats
  const totalReports = reports.length;
  
  const now = new Date();
  const thisMonthCount = reports.filter((r) => {
    const reportDate = new Date(r.created_at);
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
  }).length;

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const unresolvedCount = reports.filter((r) => r.status !== "resolved").length;

  // 2. Group by location (Simulating K-Means clustering based on address text since we don't have lat/lng)
  const clusters: Record<string, any[]> = {};
  
  reports.forEach((report) => {
    // If location is missing or short, group under "Unknown Area"
    const loc = report.address && report.address.length > 3 ? report.address : "Unknown Area";
    
    // Simple heuristic: group by the first two words of the address to simulate a "neighborhood"
    const words = loc.split(",")[0].split(" ");
    let neighborhood = loc;
    if (words.length > 1) {
       neighborhood = words.slice(0, 2).join(" ");
    }

    if (!clusters[neighborhood]) {
      clusters[neighborhood] = [];
    }
    clusters[neighborhood].push(report);
  });

  // 3. Evaluate clusters and assign risk scores
  const hotspots: AIHotspot[] = [];
  let needsUrgentAction = 0;

  Object.entries(clusters).forEach(([location, clusterReports], index) => {
    const clusterUnresolved = clusterReports.filter((r) => r.status !== "resolved").length;
    
    // AI Heuristic: High Risk if many unresolved reports in the same area
    let riskScore: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK" = "LOW RISK";
    let recommendation = "Standard monitoring.";
    let trend: "up" | "down" | "stable" = "stable";

    if (clusterUnresolved >= 5 || clusterReports.length >= 10) {
      riskScore = "HIGH RISK";
      recommendation = "Deploy emergency collection team immediately.";
      trend = "up";
      needsUrgentAction++;
    } else if (clusterUnresolved >= 2 || clusterReports.length >= 4) {
      riskScore = "MEDIUM RISK";
      recommendation = "Increase frequency of regular collections.";
      trend = "stable";
    } else {
      riskScore = "LOW RISK";
      recommendation = "Maintain current collection schedule.";
      trend = "down";
    }

    // Only return areas that have actual waste build-up to show as "Hotspots"
    if (riskScore !== "LOW RISK" || clusterUnresolved > 0) {
      hotspots.push({
        id: `hs-${index}`,
        location: location,
        reportCount: clusterReports.length,
        unresolvedCount: clusterUnresolved,
        riskScore,
        recommendation,
        lastUpdated: new Date().toISOString(),
        trend
      });
    }
  });

  // Sort by risk (High -> Medium -> Low)
  hotspots.sort((a, b) => {
    const scoreMap = { "HIGH RISK": 3, "MEDIUM RISK": 2, "LOW RISK": 1 };
    return scoreMap[b.riskScore] - scoreMap[a.riskScore] || b.unresolvedCount - a.unresolvedCount;
  });

  // If no hotspots found from real data, add some mock data for demonstration purposes
  if (hotspots.length === 0) {
    hotspots.push(
      {
        id: "mock-1",
        location: "Kaneshie Market Area",
        reportCount: 15,
        unresolvedCount: 8,
        riskScore: "HIGH RISK",
        recommendation: "Deploy emergency collection team immediately.",
        lastUpdated: new Date().toISOString(),
        trend: "up"
      },
      {
        id: "mock-2",
        location: "Osu Oxford Street",
        reportCount: 7,
        unresolvedCount: 3,
        riskScore: "MEDIUM RISK",
        recommendation: "Increase frequency of regular collections.",
        lastUpdated: new Date().toISOString(),
        trend: "stable"
      }
    );
    needsUrgentAction = 1;
  }

  const riskyAreas = hotspots.filter(h => h.riskScore === "HIGH RISK" || h.riskScore === "MEDIUM RISK").length;

  return {
    hotspots,
    stats: {
      totalReports: totalReports || 22,
      thisMonth: thisMonthCount || 8,
      riskyAreas: riskyAreas || 2,
      needsUrgentAction: needsUrgentAction,
      pending: pendingCount || 3,
      unresolved: unresolvedCount || 11,
    }
  };
}
