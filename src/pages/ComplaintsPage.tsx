import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "../components/layout";

export default function ComplaintsPage() {
  const { t } = useTranslation();

  const complaints = useMemo(
    () => [
      {
        id: "demo-1",
        subject: "Overflowing bin near the market",
        complaint_type: "Illegal Dumping",
        priority: "High",
        status: "In Progress",
      },
      {
        id: "demo-2",
        subject: "Missed pickup on Nyerere Road",
        complaint_type: "Missed Collection",
        priority: "Medium",
        status: "Pending",
      },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {t('complaints_title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Local demo complaint list while the backend is unavailable.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">{t('complaints_subject')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">{t('complaints_type')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">{t('complaints_priority')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">{t('complaints_status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{c.subject}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{c.complaint_type}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{c.priority}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}