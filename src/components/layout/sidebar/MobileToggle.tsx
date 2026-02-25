"use client";

import { forwardRef } from "react";
import { Menu, X } from "lucide-react";

const MobileToggle = forwardRef<
  HTMLButtonElement,
  {
    open: boolean;
    onToggle: () => void;
    menuId: string;
  }
>(({ open, onToggle, menuId }, ref) => (
  <button
    ref={ref}
    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-nutri-primary shadow-[0_8px_16px_rgba(18,33,46,0.12)] transition-all hover:-translate-y-0.5 hover:bg-white"
    aria-controls={menuId}
    aria-expanded={open}
    aria-label={open ? "Cerrar menu" : "Abrir menu"}
    onClick={onToggle}
  >
    {open ? <X size={21} /> : <Menu size={23} />}
  </button>
));

MobileToggle.displayName = "MobileToggle";

export default MobileToggle;
