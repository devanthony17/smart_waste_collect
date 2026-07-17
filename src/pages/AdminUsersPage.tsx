import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "../components/layout";
import { supabase } from "../lib/supabase";
import { debounce } from "../lib/debounce";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Truck,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  ChevronDown,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Edit3,
  Ban,
  Key,
  X,
} from "lucide-react";

type UserRole =
  | "super_admin"
  | "municipality_admin"
  | "company_admin"
  | "driver"
  | "citizen";

interface AppUser {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/* ─── Role config ─────────────────────────────────────── */
const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  super_admin: {
    label: "Super Admin",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: Shield,
  },
  municipality_admin: {
    label: "Municipality Admin",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: Building2,
  },
  company_admin: {
    label: "Company Admin",
    color: "text-orange-700",
    bg: "bg-orange-100",
    icon: Building2,
  },
  driver: {
    label: "Driver",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: Truck,
  },
  citizen: {
    label: "Citizen",
    color: "text-gray-700",
    bg: "bg-gray-100",
    icon: User,
  },
};

const ALL_ROLES: UserRole[] = [
  "super_admin",
  "municipality_admin",
  "company_admin",
  "driver",
  "citizen",
];

/* ─── Helpers ─────────────────────────────────────────── */
function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.citizen;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <CheckCircle2 className="w-3 h-3" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <XCircle className="w-3 h-3" />
      Inactive
    </span>
  );
}

/* ─── Add User Modal ──────────────────────────────────── */
interface AddUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function AddUserModal({ onClose, onCreated }: AddUserModalProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "citizen" as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: form.role,
            first_name: form.first_name,
            last_name: form.last_name,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("User creation failed — no ID returned.");

      // Insert into users table
      const { error: dbError } = await supabase.from("users").insert({
        id: userId,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        is_active: true,
        is_verified: false,
      });

      if (dbError) throw dbError;

      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New User
              </h2>
              <p className="text-sm text-slate-500">
                Create a new account on the platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                placeholder="John"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
                placeholder="Doe"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="john@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+255 712 345 678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as UserRole }))
              }
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_CONFIG[r].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Edit Role Modal ─────────────────────────────────── */
interface EditRoleModalProps {
  user: AppUser;
  onClose: () => void;
  onSaved: () => void;
}

function EditRoleModal({ user, onClose, onSaved }: EditRoleModalProps) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await ((supabase
      .from("users")
      .update({ role }) as any)
      .eq("id", user.id));
    setLoading(false);
    if (!error) {
      onSaved();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary-500" />
            Change Role
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Changing role for{" "}
          <span className="font-semibold text-slate-800 dark:text-white">
            {user.first_name || user.email}
          </span>
        </p>

        <div className="space-y-2">
          {ALL_ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            const Icon = cfg.icon;
            return (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  role === r
                    ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="accent-primary-500"
                />
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  {cfg.label}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || role === user.role}
            className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── User Row Actions Menu ───────────────────────────── */
interface RowMenuProps {
  user: AppUser;
  onEditRole: () => void;
  onToggleActive: () => void;
  onClose: () => void;
}

function RowMenu({ user, onEditRole, onToggleActive, onClose }: RowMenuProps) {
  return (
    <div className="absolute right-0 top-8 z-30 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => { onEditRole(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Edit3 className="w-4 h-4 text-primary-500" />
        Change Role
      </button>
      <button
        onClick={() => { onToggleActive(); onClose(); }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
          user.is_active
            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        }`}
      >
        {user.is_active ? (
          <><Ban className="w-4 h-4" />Deactivate</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" />Activate</>
        )}
      </button>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<AppUser | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const debouncedLoad = useRef(debounce(loadUsers, 500)).current;

  /* ── Stats ── */
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const roleBreakdown = ALL_ROLES.reduce(
    (acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }),
    {} as Record<UserRole, number>
  );

  /* ── Load ── */
  async function loadUsers() {
    setLoading(true);
    // @ts-ignore - Mock client typing issue
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setUsers(data as AppUser[]);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();

    const channel = (supabase
      .channel("admin-users-live") as any)
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        debouncedLoad();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  /* ── Toggle active ── */
  async function toggleActive(user: AppUser) {
    const { error } = await ((supabase
      .from("users")
      .update({ is_active: !user.is_active }) as any)
      .eq("id", user.id));

    if (!error) loadUsers();
    else alert(error.message);
  }

  /* ── Filtered list ── */
  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? u.is_active : !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-primary-500" />
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              View, create, and manage all user accounts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-600 hover:border-primary-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Users</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalUsers}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Active</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{activeUsers}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Inactive</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{totalUsers - activeUsers}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Drivers</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{roleBreakdown.driver}</p>
          </div>
        </div>

        {/* ── Role Breakdown ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ALL_ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            const Icon = cfg.icon;
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  roleFilter === r
                    ? `${cfg.bg} ${cfg.color} border-transparent shadow-sm`
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cfg.label}</span>
                <span className="ml-auto font-bold">{roleBreakdown[r]}</span>
              </button>
            );
          })}
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder:text-slate-400"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
                className="appearance-none pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="all">All Roles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_CONFIG[r].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Showing{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {filtered.length}
            </span>{" "}
            of <span className="font-semibold">{totalUsers}</span> users
          </p>
        </div>

        {/* ── Users Table ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading users…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-slate-400">
              <Users className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                      User
                    </th>
                    <th className="text-left px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                      Role
                    </th>
                    <th className="text-left px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                      Status
                    </th>
                    <th className="text-left px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.map((u) => {
                    const initials = [u.first_name?.[0], u.last_name?.[0]]
                      .filter(Boolean)
                      .join("")
                      .toUpperCase() || u.email[0].toUpperCase();

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        {/* User cell */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                                ROLE_CONFIG[u.role]?.bg
                                  .replace("bg-", "bg-")
                                  .replace("-100", "-500") ?? "bg-gray-500"
                              }`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {u.first_name || u.last_name
                                  ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                                  : "—"}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact cell */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          {u.phone ? (
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Phone className="w-3.5 h-3.5" />
                              {u.phone}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          <RoleBadge role={u.role} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge active={u.is_active} />
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(u.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() =>
                                setOpenMenuId(openMenuId === u.id ? null : u.id)
                              }
                              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === u.id && (
                              <RowMenu
                                user={u}
                                onEditRole={() => setEditRoleUser(u)}
                                onToggleActive={() => toggleActive(u)}
                                onClose={() => setOpenMenuId(null)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close row menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadUsers}
        />
      )}
      {editRoleUser && (
        <EditRoleModal
          user={editRoleUser}
          onClose={() => setEditRoleUser(null)}
          onSaved={loadUsers}
        />
      )}
    </DashboardLayout>
  );
}
