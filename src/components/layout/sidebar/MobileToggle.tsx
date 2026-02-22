"use client";

import { forwardRef } from "react";
import { Menu, X } from "lucide-react";

const MobileToggle = forwardRef<HTMLButtonElement, {
    open: boolean;
    onToggle: () => void;
    menuId: string;
}>(({ open, onToggle, menuId }, ref) => (
    <button
        ref={ref}
        className="rounded-lg px-2.5 py-1.5 text-nutri-primary"
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={onToggle}
    >
        {open ? <X size={22} /> : <Menu size={24} />}
    </button>
));

MobileToggle.displayName = "MobileToggle";

export default MobileToggle;
