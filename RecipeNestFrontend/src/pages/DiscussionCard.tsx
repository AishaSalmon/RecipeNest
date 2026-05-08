import DefaultProfile from "../assets/default-profile.png";
import type { Discussion } from "../types/discussion";
import "./Home.css";


//the props for the DiscussionCard component include the discussion data, callback functions for viewing, liking, unliking, and deleting discussions, and an optional liked boolean to indicate if the current user has liked the discussion.
// The component renders a card with the discussion's profile image, name, professional title, discussion title, and description. It also includes buttons for liking/unliking, viewing, and deleting the discussion, which trigger the corresponding callback functions when clicked.
type DiscussionCardProps = {
    discussion: Discussion;
    onView: (discussion: Discussion) => void;
    onLike: (discussionId: number) => void;
    onUnlike: (discussionId: number) => void;
    onDelete: (discussion: Discussion) => void;
    liked?: boolean;
};


//the discussion card props are passed to the discussion card component, responsible for displaying the individual discussion information as a card layout.
//it receives the discussions list and renders each discussion as a card withe their image, name, title, and description.
//it also provides buttons for liking/unliking, viewing, and deleting the discussion, which trigger the corresponding callback functions when clicked.
export default function DiscussionCard
({
  discussion,
  onView,
  onLike,
  onUnlike,
  onDelete,
  liked,
}: DiscussionCardProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  //the profileImageSrc variable is constructed to determine the correct URL for the discussion's profile image. It checks if the discussion has a profileImageURL and if it's a string. It constructs uses either the absolute or relative URL. If no images exists, it falls back to the default profile image.
  const profileImageSrc = discussion?.profileImageURL && typeof discussion.profileImageURL === "string"
        ? (discussion.profileImageURL.startsWith("http")
            ? discussion.profileImageURL
            : `${new URL(API_URL).origin}${discussion.profileImageURL.startsWith("/") ? "" : "/"}${discussion.profileImageURL}`)
        : DefaultProfile;
    
  //returning the JSX for the discussion card, which includes the profile image, name, professional title, discussion title, and description. It also includes buttons for liking/unliking, viewing, and deleting the discussion, which trigger the corresponding callback functions when clicked.
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
            <h4>{discussion.firstName} {discussion.lastName}</h4>
            <p>{discussion.professionalTitle}</p>
          </div>

          <div className="actions">

            <button onClick={() => liked ? onUnlike(discussion.discussionId) : onLike(discussion.discussionId)}>
              {liked? "Unlike" : "Like"}
            </button>

            <button onClick={() => onView(discussion)}>
              View
            </button>

             <button onClick={() => onDelete(discussion)}>
              Delete
            </button>
          </div>

        </div>

        <h3>{discussion.discussionTitle}</h3>

        <p className="truncate">
          {discussion.discussionDescription}
        </p>

      </div>
    </div>
  );
}