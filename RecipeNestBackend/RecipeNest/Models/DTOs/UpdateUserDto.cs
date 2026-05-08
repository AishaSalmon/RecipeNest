namespace RecipeNest.Models.DTOs
{
    //The update User DTO class is a Data Transfer Object (DTO) that represents the user data that can be updated by the client when a user wants to edit their profile information.
    //The DTO transfers only the necessary data from the client to the server.
    public class UpdateUserDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
