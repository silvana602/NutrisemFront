import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function IconButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={`flex items-center gap-2 font-semibold ${className}`}
    >
      <Plus size={18} />
      {label}
    </Button>
  );
}
