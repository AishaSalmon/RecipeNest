namespace RecipeNest.Models
{
    //This is the Discussion class, which represents the discussions that a user can create in the application.
    //It defines properties for the discussion's title, description, creation and update timestamps, deletion status, and visibility status.
    public class Discussion
    {
        public int DiscussionId { get; set; }
        public string DiscussionTitle { get; set; } = null!;
        public string DiscussionDescription { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
        public bool IsPublic { get; set; }

        //It also has a foreign key relationship to the User class, allowing us to associate a discussion with a specific user account.
        public string? UserId { get; set; }
        public User? User { get; set; }

        public ICollection<DiscussionLikes> DiscussionLikes { get; set; } = new List<DiscussionLikes>();
    }
}
