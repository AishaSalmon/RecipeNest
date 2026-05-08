namespace RecipeNest.Models.DTOs
{
    //This DTO is used to retrieve discusssion likes information from the client to the server when a user wants to like or unlike a discussion defined by a POST request.
    public class DiscussionLikesDto
    {
        public int DiscussionId { get; set; }
    }
}
