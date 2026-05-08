namespace RecipeNest.Models
{
    //This is the DiscussionLikes class, which represents the likes that a user can give to a discussion in the application.
    public class DiscussionLikes
    {
        public int DiscussionLikesId { get; set; }
        public DateTime LikedAt { get; set; } = DateTime.Now;

        //It has a foreign key relationship with the discussion class, allowing users to have multiple likes on different discussions.
        public int DiscussionId { get; set; }
        public Discussion? Discussion { get; set; }

        //Foreign key relationship to the User class.
        public string? UserId { get; set; }
        public User? User { get; set; }
    }
}
