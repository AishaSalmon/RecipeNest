namespace RecipeNest.Models.DTOs
{
    //Represents the data required to create a new chef profile. It is defined by the POST request body.
    public class CreateChefProfileDto
    {
        public string ProfessionalTitle { get; set; } = null!;
        public string Bio { get; set; } = null!;
        public IFormFile? ProfileImageURL { get; set; }
        public bool IsProfileVisible { get; set; }
    }
}
