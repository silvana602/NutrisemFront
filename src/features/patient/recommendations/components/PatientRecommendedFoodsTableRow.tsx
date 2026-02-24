import Avatar from "@/components/ui/Avatar";

import type { RecommendedFoodRow } from "../types";

type PatientRecommendedFoodsTableRowProps = {
  row: RecommendedFoodRow;
};

export function PatientRecommendedFoodsTableRow({
  row,
}: PatientRecommendedFoodsTableRowProps) {
  return (
    <tr className="border-t border-nutri-light-grey align-top">
      <td className="px-3 py-2">
        <Avatar
          name={row.foodName}
          size={36}
          title={row.imageAlt}
          withBorder
          className="mx-auto"
        />
      </td>

      <td className="px-3 py-2">
        <p className="font-medium text-nutri-dark-grey">{row.foodName}</p>
        <p className="text-xs text-nutri-dark-grey/70">{row.category}</p>
      </td>

      <td className="px-3 py-2 text-nutri-dark-grey">{row.benefits}</td>

      <td className="px-3 py-2 text-nutri-dark-grey">
        <p>{row.portion}</p>
        <p className="mt-1 text-xs text-nutri-dark-grey/70">Edad ref.: {row.referenceAge}</p>
      </td>

      <td className="px-3 py-2 text-nutri-dark-grey">{row.frequency}</td>
    </tr>
  );
}
