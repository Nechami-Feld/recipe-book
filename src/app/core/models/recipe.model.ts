export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'drink' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  category: RecipeCategory;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  isFavorite: boolean;
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  breakfast: 'ארוחת בוקר',
  lunch: 'ארוחת צהריים',
  dinner: 'ארוחת ערב',
  dessert: 'קינוח',
  snack: 'חטיף',
  drink: 'שתייה',
  other: 'אחר'
};
