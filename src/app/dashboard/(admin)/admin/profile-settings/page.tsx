import { SettingsPage } from "@/features/settings/components";
import { UserRole } from "@/types/user";

export default function AdminProfileSettingsPage() {
  return <SettingsPage role={UserRole.admin} />;
}
