import { useMemo } from "react";
import { CalendarDays, Clock3, MapPin, Truck } from "lucide-react";
import { DashboardLayout } from "../components/layout";

export default function SchedulesPage() {
  const scheduleItems = useMemo(
    () => [
      { day: "Monday", time: "07:00 - 09:00", zone: "Nyerere Road", vehicle: "TRK-102" },
      { day: "Tuesday", time: "08:00 - 10:00", zone: "Kivukoni", vehicle: "TRK-204" },
      { day: "Wednesday", time: "06:30 - 08:30", zone: "Mikocheni", vehicle: "TRK-118" },
      { day: "Thursday", time: "09:00 - 11:00", zone: "Kijitonyama", vehicle: "TRK-305" },
      { day: "Friday", time: "07:30 - 09:30", zone: "Upanga", vehicle: "TRK-221" },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Schedules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weekly collection timetable for waste pickup routes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scheduleItems.map((item) => (
            <div key={item.day} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2 text-lg font-semibold text-secondary-900 dark:text-white">
                <CalendarDays className="h-5 w-5 text-emerald-500" />
                {item.day}
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  <span>{item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{item.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>{item.vehicle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
