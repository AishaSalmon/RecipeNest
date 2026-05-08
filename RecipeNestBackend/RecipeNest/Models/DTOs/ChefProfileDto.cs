namespace RecipeNest.Models.DTOs
{
    //This DTO is used to get the Chef Profile information from the server to the client when a user wants to view the chef profile information of a chef profile.
    //It includes the chef profile information as well as the list of specializations associated with the chef profile, define by a GET request body.
    public class ChefProfileDto
    {
        public int ChefProfileId { get; set; }
        public string ProfessionalTitle { get; set; } = null!;
        public string? Bio { get; set; }
        public string? ProfileImageURL { get; set; }
        public bool IsProfileVisible { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public List<Recipe> Recipes { get; set; } = new List<Recipe>();
    }
}
