export enum SkinType {
  DRY = 'Dry',
  OILY = 'Oily',
  COMBINATION = 'Combination',
  NORMAL = 'Normal',
  SENSITIVE = 'Sensitive'
}

export enum SkinConcern {
  ACNE = 'Acne & Blemishes',
  WRINKLES = 'Fine Lines & Wrinkles',
  DARK_SPOTS = 'Dark Spots & Hyperpigmentation',
  REDNESS = 'Redness & Rosacea',
  DULLNESS = 'Dullness',
  TEXTURE = 'Uneven Texture',
  PORES = 'Enlarged Pores',
  DRYNESS = 'Extreme Dryness'
}

export interface UserProfile {
  name: string;
  skinType: SkinType | null;
  concerns: SkinConcern[];
  sensitivity: boolean;
}

export interface MarketProduct {
  name: string;
  brand: string;
  approxPrice: string;
}

export interface ProductRecommendation {
  stepName: string; // e.g., "Cleanser", "Toner"
  productType: string; // e.g., "Salicylic Acid Cleanser"
  keyIngredients: string[];
  ingredientBenefits: string;
  reason: string;
  usageTips: string;
  marketRecommendations: MarketProduct[];
}

export interface RoutineResponse {
  analysis: string;
  morningRoutine: ProductRecommendation[];
  eveningRoutine: ProductRecommendation[];
  dietaryTips: string[];
  avoidIngredients: string[];
}

export enum AppState {
  WELCOME,
  QUIZ,
  LOADING,
  RESULTS,
  ERROR
}