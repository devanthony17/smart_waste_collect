import { supabase } from "../lib/supabase";

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
}

export interface SubscriptionRecord {
  userId: string;
  userEmail: string;
  userName: string;
  status: "Active" | "Expiring Soon" | "Expired" | "No Subscription";
  lastPaymentDate: string | null;
  daysRemaining: number;
  paymentMethod: string;
}

export interface FinanceDashboardData {
  payments: PaymentRecord[];
  subscriptions: SubscriptionRecord[];
  stats: {
    totalRevenue: number;
    activeSubscriptions: number;
    pendingPayments: number;
    momoVolume: number;
  };
}

/**
 * Normalizes payment methods to Ghanaian contexts if needed.
 * For example, if a legacy record says "m_pesa", we can map it to "mtn_momo".
 */
export const normalizePaymentMethod = (method: string): string => {
  const m = method?.toLowerCase() || "unknown";
  if (m.includes("pesa") || m.includes("momo") || m.includes("mtn")) return "MTN MoMo";
  if (m.includes("tigo") || m.includes("airtel")) return "AirtelTigo";
  if (m.includes("telecel") || m.includes("vodafone")) return "Telecel Cash";
  if (m.includes("card") || m.includes("visa") || m.includes("stripe")) return "Card";
  if (m.includes("bank")) return "Bank Transfer";
  return method;
};

export async function fetchFinanceData(): Promise<FinanceDashboardData> {
  // Fetch payments
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (paymentsError) {
    console.error("Failed to fetch payments", paymentsError);
    throw new Error("Failed to load payment data");
  }

  // Fetch users (profiles)
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("*");

  if (usersError) {
    console.error("Failed to fetch users", usersError);
    // Continue without users if it fails, just means subscriptions won't have names
  }

  const payments: PaymentRecord[] = paymentsData || [];
  const users = usersData || [];

  // Calculate top level stats
  let totalRevenue = 0;
  let pendingPayments = 0;
  let momoVolume = 0;

  payments.forEach((p) => {
    if (p.status === "completed") {
      totalRevenue += Number(p.amount) || 0;
      const normalized = normalizePaymentMethod(p.payment_method);
      if (["MTN MoMo", "AirtelTigo", "Telecel Cash"].includes(normalized)) {
        momoVolume += Number(p.amount) || 0;
      }
    } else if (p.status === "pending") {
      pendingPayments++;
    }
  });

  // Calculate simulated subscriptions
  // Group latest completed payment by user to determine subscription status
  const userLatestPayment = new Map<string, PaymentRecord>();
  
  payments.forEach(p => {
    if (p.status !== "completed" || !p.user_id) return;
    const existing = userLatestPayment.get(p.user_id);
    if (!existing || new Date(p.created_at) > new Date(existing.created_at)) {
      userLatestPayment.set(p.user_id, p);
    }
  });

  let activeSubscriptions = 0;
  const subscriptions: SubscriptionRecord[] = users.map(user => {
    const latestPayment = userLatestPayment.get(user.id);
    
    let status: SubscriptionRecord["status"] = "No Subscription";
    let daysRemaining = 0;
    
    if (latestPayment) {
      // Assuming a payment grants 30 days of subscription
      const paymentDate = new Date(latestPayment.created_at);
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining > 5) {
        status = "Active";
        activeSubscriptions++;
      } else if (daysRemaining > 0) {
        status = "Expiring Soon";
        activeSubscriptions++;
      } else {
        status = "Expired";
        daysRemaining = 0;
      }
    }

    return {
      userId: user.id,
      userEmail: user.email || "Unknown",
      userName: user.full_name || user.email?.split("@")[0] || "Unknown User",
      status,
      lastPaymentDate: latestPayment ? latestPayment.created_at : null,
      daysRemaining,
      paymentMethod: latestPayment ? normalizePaymentMethod(latestPayment.payment_method) : "None"
    };
  });

  // Sort subscriptions: Expiring Soon -> Active -> Expired -> No Subscription
  subscriptions.sort((a, b) => {
    const rank = { "Expiring Soon": 1, "Active": 2, "Expired": 3, "No Subscription": 4 };
    return rank[a.status] - rank[b.status];
  });

  return {
    payments,
    subscriptions,
    stats: {
      totalRevenue,
      activeSubscriptions,
      pendingPayments,
      momoVolume
    }
  };
}
