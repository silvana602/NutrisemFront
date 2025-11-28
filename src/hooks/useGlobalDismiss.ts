"use client";
import { useEffect } from "react";

export function useGlobalDismiss(
    closeFns: Array<() => void>,
    protectedNodes: Array<React.RefObject<HTMLElement | null>>
) {
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            const clickedInside = protectedNodes.some(ref => ref.current?.contains(t));
            if (clickedInside) return;
            closeFns.forEach(fn => fn());
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeFns.forEach(fn => fn());
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [closeFns, protectedNodes]);
}