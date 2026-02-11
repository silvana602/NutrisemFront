"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "")).toUpperCase();
}

type Props = {
  name?: string;
  src?: string | null;
  size?: number;
  className?: string;
  title?: string;
  withBorder?: boolean;
};

export default function Avatar({
  name,
  src,
  size = 34,
  className = "",
  title,
  withBorder = true,
}: Props) {
  const [errored, setErrored] = useState(false);
  const canShowImg = !!src && !errored;

  const textSizeClass = useMemo(() => {
    if (size <= 20) return "text-[10px]";
    if (size <= 28) return "text-xs";
    if (size <= 36) return "text-sm";
    if (size <= 48) return "text-base";
    if (size <= 64) return "text-lg";
    if (size <= 80) return "text-xl";
    if (size <= 96) return "text-2xl";
    return "text-3xl";
  }, [size]);

  const borderColor = "var(--color-nutri-primary)";
  const fallbackBg =
    "linear-gradient(135deg, var(--color-nutri-primary) 0%, var(--color-nutri-secondary) 100%)";

  if (canShowImg) {
    return (
      <Image
        src={src as string}
        alt={name ? `Avatar de ${name}` : "Avatar de usuario"}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        className={`rounded-full object-cover shadow-sm ${withBorder ? "border" : ""} ${className}`}
        style={{
          width: size,
          height: size,
          borderColor: withBorder ? borderColor : "transparent",
        }}
      />
    );
  }

  return (
    <span
      style={{
        width: size,
        height: size,
        background: fallbackBg,
        borderColor: withBorder ? borderColor : "transparent",
      }}
      className={`grid place-items-center rounded-full text-nutri-white font-semibold shadow-sm ${textSizeClass} ${withBorder ? "border" : ""} ${className}`}
      title={title ?? name}
    >
      {getInitials(name)}
    </span>
  );
}
