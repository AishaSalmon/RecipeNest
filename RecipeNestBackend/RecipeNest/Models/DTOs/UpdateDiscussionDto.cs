namespace RecipeNest.Models.DTOs
{
    //This DTO represents the discussion information that is passed down and updated from the client to the server when a user wants to edit their discussion.
    public class UpdateDiscussionDto
    {
        public string DiscussionTitle { get; set; } = null!;
        public string DiscussionDescription { get; set; } = null!;
    }
}
