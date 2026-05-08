import type { Discussion } from "../types/discussion";
import DefaultProfile from "../assets/default-profile.png";

type ViewDiscussionProps = {
  discussion: Discussion;
  loading?: boolean;
  error?: string;
  success?: string;
};


//the viewdiscussion page is responsible for displaying the details of a specific discussion, including the chef's profile information, the discussion title, and description.
//the function accepts the discussion object as a prop, alongside loading state, error messages and success messages to provide feedback to the user.
export default function ViewDiscussion({
  discussion,
  loading = false,
  error = "",
  success = "",
}: ViewDiscussionProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const profileImageSrc = discussion?.profileImageURL && typeof discussion.profileImageURL === "string"
        ? (discussion.profileImageURL.startsWith("http")
            ? discussion.profileImageURL
            : `${new URL(API_URL).origin}${discussion.profileImageURL.startsWith("/") ? "" : "/"}${discussion.profileImageURL}`)
        : DefaultProfile;
    

  //the return statement ensures to return the user information on the top of the page, followed by the discussion title and description. 
  //It also conditionally renders loading, error, and success messages based on the component's state.
  return (
    <div >
      <div className="discussion-card">

        <div className="discussion-top"/>

            <div className="chef-info">
                <img
                    className="profile-avatar"
                    src={profileImageSrc}
                    alt="chef"
                />

                <div className="discussion-user">
                    <h4>
                        {discussion.firstName ?? "Unknown"}{" "}
                        {discussion.lastName ?? "Chef"}
                    </h4>

                    <p>{discussion.professionalTitle ?? "Chef"}</p>
                </div>
            </div>
        </div>



        <div className="discussion-box">
            <h2>{discussion.discussionTitle}</h2>
        </div>


        <div className="discussion-box large">
            <p>{discussion.discussionDescription}</p>
        </div>

      {loading && <p className="view-discussion__status">Loading...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}