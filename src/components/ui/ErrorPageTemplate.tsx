"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorActionVariant = "outline" | "solid";

export type ErrorPageAction = {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  variant?: ErrorActionVariant;
};

type ErrorPageTemplateProps = {
  code: string;
  title: string;
  message: string;
  imagePath: string;
  imageAlt: string;
  actions: ErrorPageAction[];
  badgeLabel?: string;
  imageClassName?: string;
};

const ACTION_STYLES: Record<ErrorActionVariant, string> = {
  outline:
    "border-nutri-primary/20 bg-nutri-white text-nutri-primary shadow-[0_10px_24px_rgba(23,42,58,0.14)] hover:-translate-y-0.5 hover:bg-nutri-primary hover:text-nutri-white focus-visible:ring-nutri-secondary/45 focus-visible:ring-offset-nutri-off-white",
  solid:
    "border-transparent bg-nutri-secondary text-nutri-white shadow-[0_10px_24px_rgba(86,124,141,0.28)] hover:-translate-y-0.5 hover:bg-nutri-primary focus-visible:ring-nutri-secondary/45 focus-visible:ring-offset-nutri-off-white",
};

export function ErrorPageTemplate({
  code,
  title,
  message,
  imagePath,
  imageAlt,
  actions,
  badgeLabel,
  imageClassName,
}: ErrorPageTemplateProps) {
  const badgeText = badgeLabel ?? `ERROR ${code}`;

  return (
    <section className="relative h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] w-full overflow-x-hidden overflow-y-auto bg-nutri-off-white lg:overflow-y-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_12%,rgba(86,124,141,0.2),transparent_42%),radial-gradient(circle_at_84%_86%,rgba(23,42,58,0.14),transparent_56%),linear-gradient(120deg,#F5EFEB_8%,#E7E9E3_100%)]" />

      <div className="relative mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-5 px-4 py-3 sm:gap-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-10">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-nutri-secondary/30 bg-nutri-secondary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-nutri-secondary">
            {badgeText}
          </span>

          <p className="mt-3 text-[clamp(2.4rem,10vw,6.2rem)] font-extrabold leading-none text-nutri-primary">
            {code}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-nutri-primary sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-nutri-dark-grey sm:text-base lg:text-lg">
            {message}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              const variant = action.variant ?? "outline";

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={cn(
                    "inline-flex min-w-[165px] items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    ACTION_STYLES[variant]
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <div className="relative mx-auto w-full max-w-[920px] lg:ml-auto lg:mr-0">
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-nutri-secondary/35 via-transparent to-transparent blur-3xl" />
            <Image
              src={imagePath}
              alt={imageAlt}
              width={1400}
              height={1400}
              priority
              className={cn(
                "relative z-10 h-auto w-full max-h-[42vh] object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.38)] sm:max-h-[50vh] lg:max-h-[70vh]",
                imageClassName
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
