export type RestrictedFoodItem = {
  food: string;
  healthySubstitute: string;
};

export type RestrictedFoodGroup = {
  title: string;
  subtitle: string;
  items: RestrictedFoodItem[];
  tone: "red" | "amber";
};
