import DefaultProfile from "../assets/default-profile.png";
import DefaultRecipeImage from "../assets/default-recipe-image.png";
import type { Recipe } from "../types/recipe";
import "./Home.css";


//the type props for the saved recipe card component, it takes in a recipe object and onDelete, onView, and onShare function props.
//these functions are used to handle user interactions with the saved recipe card, such as deleting the saved recipe, viewing the recipe details, or sharing the recipe with others.
type SavedRecipeCardProps = {
    recipe: Recipe;
    onDelete: (recipeId: number) => void;
    onView: (recipe: Recipe) => void;
    onShare: (recipeId: number) => void;
};


//the savedRecipeCard component is responsible for displaying a saved recipe in teh user's profile in form of a card. It shows the chef's profile information, the recipe title, description and their profile and recipe images.
export default function SavedRecipeCard({
  recipe,
  onDelete,
  onView,
  onShare,
}: SavedRecipeCardProps) {
    const API_URL = import.meta.env.VITE_API_URL;
    const profileImageSrc = recipe?.profileImageURL && typeof recipe.profileImageURL === "string"
        ? (recipe.profileImageURL.startsWith("http")
            ? recipe.profileImageURL
            : `${new URL(API_URL).origin}${recipe.profileImageURL.startsWith("/") ? "" : "/"}${recipe.profileImageURL}`)
        : DefaultProfile;
    
    const recipeImageSrc = recipe?.recipeImageURL && typeof recipe.recipeImageURL === "string"
        ? (recipe.recipeImageURL.startsWith("http")
            ? recipe.recipeImageURL
            : `${new URL(API_URL).origin}${recipe.recipeImageURL.startsWith("/") ? "" : "/"}${recipe.recipeImageURL}`)
        : DefaultRecipeImage;

  return (
    <div className="cardd">

      <div className="recipe-content">

        <div className="recipeHeader">

          <img
            className="profile-avatar"
            src={profileImageSrc}
            alt="chef"
          />

          <div className="profile">
            <h4>{recipe.firstName} {recipe.lastName}</h4>
            <p>{recipe.professionalTitle ?? "Chef"}</p>
          </div>

          <div className="actions"> {/* //to remove the recipe from saved recipes, to share the recipe and to view the recipe details. */}
            <button onClick={() => onDelete(recipe.recipeId)}>
              Remove from saved
            </button>

            <button onClick={() => onShare(recipe.recipeId)}> {/* //to share the recipe with others. */}
              Share
            </button>

            <button onClick={() => onView(recipe)}>  {/* //to view the recipe details in a modal. */}
              View
            </button>
          </div>

        </div>

        <h3>{recipe.recipeTitle}</h3>

        <p className="truncate">
          {recipe.recipeDescription}
        </p>

      </div>

      <div className="recipe-image">
        <img
          src={recipeImageSrc}
          alt={recipe.recipeTitle}
        />
      </div>

    </div>
  );
}