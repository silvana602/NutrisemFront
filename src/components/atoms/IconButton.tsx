import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function IconButton({ label, onClick }: { label: string;
onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="flex items-center gap-2 font-semibold"
    >
      <Plus size={18} />
      {label}
    </Button>
  );
}
