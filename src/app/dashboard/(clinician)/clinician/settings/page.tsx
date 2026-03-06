import { SettingsPage } from "@/features/settings/components";
import { UserRole } from "@/types/user";

export default function ClinicianSettingsPage() {
  return <SettingsPage role={UserRole.clinician} />;
}
