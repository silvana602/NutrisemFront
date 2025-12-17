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
        className="text-nutri-primary px-3 py-2"
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={onToggle}
    >
        {open ? <CgClose size={25} /> : <TiThMenu size={35} />}
    </button>
));

MobileToggle.displayName = "MobileToggle";

export default MobileToggle;