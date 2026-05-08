namespace RecipeNest.Models.DTOs
{
    //The UserDto class is a Data Transfer Object (DTO) that represents the user data that will be sent to the client when a user logs in or registers.
    public class UserDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? UserName { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }       
}