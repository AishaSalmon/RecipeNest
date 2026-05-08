namespace RecipeNest.Models.DTOs
{
    //When a user wants to create a new discussion in the applicaiton, this DTO represents the discussion information that is passed form client to server defined by the POST request body.
    public class CreateDiscussionDto
    {
        public string DiscussionTitle { get; set; } = null!;
        public string DiscussionDescription { get; set; } = null!; 
    }
}
