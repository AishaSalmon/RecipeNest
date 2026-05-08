import DefaultProfile from "../assets/default-profile.png";
import type { ChefProfile } from "../types/ChefProfile";
import "./Home.css";

//cheflist card component, used to display the chef profile information in the chef list page, and also used in the modal to display the chef profile information when a chef is selected.
type ChefListCardProps = {
    chef: ChefProfile;
    onViewProfile: () => void;
    onViewRecipes: () => void;
};

//This functiona acceps the ChefListCardProps as props, which includes the chef profile information, and two functions to handle the view profile and view recipes actions.
//It renders the chef profile information in a card format including a button to view their recipes.
export default function ChefListCard
({
  chef,
  onViewRecipes,
  onViewProfile,
}: ChefListCardProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  // The profile image is used ensure that it displays correctly whether it's a full URL or a relative path from the API or a default image.
  const profileImageSrc = chef?.profileImageURL && typeof chef.profileImageURL === "string"
    ? (chef.profileImageURL.startsWith("http")
        ? chef.profileImageURL
        : `${new URL(API_URL).origin}${chef.profileImageURL.startsWith("/") ? "" : "/"}${chef.profileImageURL}`)
    : DefaultProfile;
    
  return (
    <div className="card">

      <div className="recipe-content">

        <div className="recipeHeader">

          <img
            className="profile-avatar"
            src={profileImageSrc}
            alt="chef"
          />

          <div className="profile">
            <h4>{chef.firstName} {chef.lastName}</h4>
            <p>{chef.professionalTitle}</p>
          </div>

          <div className="actions">

            <button onClick={onViewProfile}>
              View Profile
            </button>

            <button onClick={onViewRecipes}>
              View Recipes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}