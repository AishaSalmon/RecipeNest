// This file defines the Recipe and RecipeIngredient types, which represent the structure of the data related to recipes and their ingredients.
// It ensures that the data type of the data retrieved from the backend related to recipes is consistent and type-safe when used throughout the application, such as in pages like the recipe list and recipe detail pages.

export type RecipeIngredient = {
  ingredientName: string;
  ingredientQuantity: number;
  unitOfMeasurement: string;
};

export type Recipe = {
  recipeId: number;
  recipeTitle: string;
  recipeDescription: string;
  cookingInstructions: string;
  recipeIngredients: RecipeIngredient[];
  recipeImageURL?: string;
  createdAt?: string;
  profileImageURL?: string;
  firstName?: string;
  lastName?: string;
  professionalTitle?: string;
};