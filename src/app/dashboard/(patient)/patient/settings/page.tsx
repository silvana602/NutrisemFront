import { SettingsPage } from "@/features/settings/components";
import { UserRole } from "@/types/user";

export default function PatientSettingsPage() {
  return <SettingsPage role={UserRole.patient} />;
}
