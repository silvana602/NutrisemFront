"use client";

import { forwardRef } from "react";
import { CgClose } from "react-icons/cg";
import { TiThMenu } from "react-icons/ti";

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
        {open ? <CgClose size={22} /> : <TiThMenu size={28} />}
    </button>
));

MobileToggle.displayName = "MobileToggle";

export default MobileToggle;
