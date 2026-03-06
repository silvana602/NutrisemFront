"use client";

import type { OmsPercentileAnchorSetting } from "../types";

type OmsPercentilesSectionProps = {
  anchors: OmsPercentileAnchorSetting[];
  onUpdateAnchor: (anchorKey: OmsPercentileAnchorSetting["key"], next: OmsPercentileAnchorSetting) => void;
};

export function OmsPercentilesSection({
  anchors,
  onUpdateAnchor,
}: OmsPercentilesSectionProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Percentiles OMS</h2>
      <p className="mt-1 text-sm text-nutri-dark-grey/85">
        Ajusta percentiles y puntajes Z de referencia para los cálculos antropométricos.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-nutri-light-grey/80">
        <table className="min-w-[620px] w-full bg-white/80 text-sm">
          <thead className="bg-nutri-off-white text-xs uppercase tracking-wide text-nutri-dark-grey/80">
            <tr>
              <th className="px-3 py-3 text-left">Ancla</th>
              <th className="px-3 py-3 text-left">Percentil</th>
              <th className="px-3 py-3 text-left">Puntaje Z</th>
            </tr>
          </thead>
          <tbody>
            {anchors.map((anchor) => (
              <tr key={anchor.key} className="border-t border-nutri-light-grey/70">
                <td className="px-3 py-3 font-semibold text-nutri-primary">{anchor.label}</td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={anchor.percentile}
                    onChange={(event) =>
                      onUpdateAnchor(anchor.key, {
                        ...anchor,
                        percentile: Number(event.target.value),
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    step="0.1"
                    value={anchor.zScore}
                    onChange={(event) =>
                      onUpdateAnchor(anchor.key, {
                        ...anchor,
                        zScore: Number(event.target.value),
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
