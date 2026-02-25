import { SettingsPage } from "@/features/settings/components";
import { UserRole } from "@/types/user";

export default function AdminSettingsPage() {
  return <SettingsPage role={UserRole.admin} />;
}
