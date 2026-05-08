namespace RecipeNest.Models.DTOs
{
    //THe discussionDto is used to transfer discussion information from the server to the client to display the discussion information defined by a GET request.
    public class DiscussionDto
    {
        public int DiscussionId { get; set; }
        public string DiscussionTitle { get; set; } = null!;
        public string DiscussionDescription { get; set; } = null!;
        public int LikesCount { get; set; } = 0;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfileImageURL { get; set; }
        public string? ProfessionalTitle { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
