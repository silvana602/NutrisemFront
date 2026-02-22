import { AlertTriangle, ShieldAlert } from "lucide-react";

import type { RestrictedFoodGroup } from "@/features/shared/nutrition";

type RestrictedFoodsListProps = {
  groups: RestrictedFoodGroup[];
  title?: string;
  description?: string;
};

function getToneClasses(tone: RestrictedFoodGroup["tone"]): string {
  if (tone === "red") {
    return "border-rose-200 bg-rose-50";
  }

  return "border-amber-200 bg-amber-50";
}

function ToneIcon({ tone }: { tone: RestrictedFoodGroup["tone"] }) {
  if (tone === "red") {
    return <ShieldAlert size={18} className="text-rose-700" aria-hidden />;
  }

  return <AlertTriangle size={18} className="text-amber-700" aria-hidden />;
}

export function RestrictedFoodsList({
  groups,
  title = "Alimentos restringidos",
  description = "Ordenados desde lo que debes evitar por completo hasta lo que debes disminuir.",
}: RestrictedFoodsListProps) {
  return (
    <section className="space-y-3 rounded-lg border border-nutri-light-grey bg-nutri-white p-4">
      <header>
        <h3 className="text-base font-semibold text-nutri-primary">{title}</h3>
        <p className="text-sm text-nutri-dark-grey/80">{description}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.title}
            className={`rounded-xl border p-4 ${getToneClasses(group.tone)}`}
          >
            <header className="mb-2 flex items-center gap-2">
              <ToneIcon tone={group.tone} />
              <h4 className="text-sm font-semibold text-nutri-dark-grey">{group.title}</h4>
            </header>
            <p className="mb-2 text-xs text-nutri-dark-grey/80">{group.subtitle}</p>
            <ul className="space-y-1 text-sm text-nutri-dark-grey">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-nutri-dark-grey/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
