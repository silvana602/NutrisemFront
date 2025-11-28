"use client";

export const Backdrop = ({
    show,
    className = "",
    onClick,
    desktopOnly = false,
    mobileOnly = false,
}: {
    show: boolean;
    onClick?: () => void;
    className?: string;
    desktopOnly?: boolean;
    mobileOnly?: boolean;
}) => {
    if (!show) return null;
    const base = "fixed inset-0 z-40 bg-black/30";
    const vis = desktopOnly ? "hidden md:block" : mobileOnly ? "md:hidden" : "";
    return <div className={`${base} ${vis} ${className}`} aria-hidden onClick={onClick} />;
}