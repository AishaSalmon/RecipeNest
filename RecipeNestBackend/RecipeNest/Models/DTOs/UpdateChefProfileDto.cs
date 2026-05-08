namespace RecipeNest.Models.DTOs
{
    //This DTO transfers the chef profile information update data from the client to the server when a user wants to edit their profile information.
    //The data is defined by the PUT request body and is used to update the chef profile information in the database.
    public class UpdateChefProfileDto
    {
        public string ProfessionalTitle { get; set; } = null!;
        public string? Bio { get; set; }
        public IFormFile? ProfileImageURL { get; set; }
        public bool IsProfileVisible { get; set; }
    }
}
