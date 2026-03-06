"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { db, seedOnce } from "@/mocks/db";
import {
  AdminDashboardHero,
  AdminGlobalKpisSection,
  AdminHourlyActivitySection,
  AdminServiceStatusSection,
} from "@/features/admin/dashboard/components";
import {
  createAdminDashboardData,
  isDatabaseOperational,
} from "@/features/admin/dashboard/utils";

seedOnce();

export default function AdminDashboardContent() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const apiOperational =
    typeof window === "undefined" ? true : Boolean(window.navigator.onLine);

  const dashboardData = createAdminDashboardData({
    users: db.users,
    patients: db.patients,
    consultations: db.consultations,
    apiOperational,
    databaseOperational: isDatabaseOperational(db),
  });

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <AdminDashboardHero firstName={user.firstName} lastName={user.lastName} />
      </div>

      <AdminGlobalKpisSection kpis={dashboardData.kpis} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <AdminHourlyActivitySection
          hourlyActivity={dashboardData.hourlyActivity}
          peakActivityLabel={dashboardData.peakActivityLabel}
        />
        <AdminServiceStatusSection
          statuses={dashboardData.serviceStatuses}
          updatedAt={dashboardData.updatedAt}
        />
      </div>
    </div>
  );
}
