using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using RecipeNest.Data;
using RecipeNest.Models;
using RecipeNest.Models.DTOs;
using Microsoft.AspNetCore.Http.HttpResults;


//THis controller manages CRUD operations related to the chef profile, allowing authenticated users to created, read, update and delete their chef profile. Each chef can only have one profile, and they can only manage their own profile.
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChefProfileController : ControllerBase
{
    private readonly RecipeNestDbContext _context;

    public ChefProfileController(RecipeNestDbContext context)
    {
        _context = context;
    }

    //CREATE Chef Profile. The endpoint is an asynchronous POSt method that acceps a CreateChefProfileDto object.
    //If the user exists and such user has no prefious profile, the profile is created with an OK response, else an error message is returned.
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateChefProfile([FromForm] CreateChefProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        // prevent duplicate profile
        var existingProfile = await _context.ChefProfiles
            .FirstOrDefaultAsync(cp => cp.UserId == userId);

        if (existingProfile != null)
            return BadRequest("Profile already exists");

        //If a profile image is included in the request, it is saved to the server and the URL is stored in the database.
        string imagePath = null; //checks that the user has no previous profile image.

        if (dto.ProfileImageURL != null)
        {
            var folderName = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images"); //creating a folder path to store the uploaded images.

            if (!Directory.Exists(folderName))
            {
                Directory.CreateDirectory(folderName);
            }

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ProfileImageURL.FileName);

            var fullPath = Path.Combine(folderName, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dto.ProfileImageURL.CopyToAsync(stream);
            }
            imagePath = "/image/" + fileName; // final image path to be stored as the URL in the database, which can be used to access the image later.
        }


        var profile = new ChefProfile
        {
            ProfessionalTitle = dto.ProfessionalTitle,
            Bio = dto.Bio,
            ProfileImageURL = imagePath,
            IsProfileVisible = dto.IsProfileVisible,
            CreatedAt = DateTime.Now,
            UserId = userId
        };

        _context.ChefProfiles.Add(profile); //chef profile created.
        await _context.SaveChangesAsync();

        return Ok(new { message = "Chef profile created" });
    }


    //GET my profile. This endpoint allows authenticated users to retrieve their chef profile information.
    //It queries the database for the profile associated with the authenticated user's ID and returns it as a ChefProfileDto object.
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var profile = await _context.ChefProfiles
            .Where(cp => cp.UserId == userId)
            .Select(cp => new ChefProfileDto
            {
                ChefProfileId = cp.ChefProfileId,
                ProfessionalTitle = cp.ProfessionalTitle,
                Bio = cp.Bio,
                ProfileImageURL = cp.ProfileImageURL,
                IsProfileVisible = cp.IsProfileVisible,
                FirstName = cp.User.FirstName,
                LastName = cp.User.LastName
            })
            .FirstOrDefaultAsync();

        if (profile == null)
            return NotFound();

        return Ok(profile);
    }



    //GET all chef profiles. This endpoint returns all visible chef profiles.
    //No authentication required - anyone can view public chef profiles.
    [AllowAnonymous]
    [HttpGet("All")]
    public async Task<IActionResult> GetAllProfiles()
    {
        var profiles = await _context.ChefProfiles
            .Where(cp => cp.IsProfileVisible)
            .Select(cp => new ChefProfileDto
            {
                ChefProfileId = cp.ChefProfileId,
                ProfessionalTitle = cp.ProfessionalTitle,
                Bio = cp.Bio,
                ProfileImageURL = cp.ProfileImageURL,
                IsProfileVisible = cp.IsProfileVisible,
                FirstName = cp.User.FirstName,
                LastName = cp.User.LastName,
                Recipes = cp.User.Recipes.ToList(),
            })
            .ToListAsync();

        if (profiles.Count == 0)
            return Ok(new { message = "No chef profiles available", data = new List<ChefProfileDto>() });

        return Ok(profiles);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAProfile(int id)
    {
        var profile = await _context.ChefProfiles
            .Where(cp => cp.IsProfileVisible && id == cp.ChefProfileId)
            .Select(cp => new ChefProfileDto
            {
                ChefProfileId = cp.ChefProfileId,
                ProfessionalTitle = cp.ProfessionalTitle,
                Bio = cp.Bio,
                ProfileImageURL = cp.ProfileImageURL,
                IsProfileVisible = cp.IsProfileVisible,
                FirstName = cp.User.FirstName,
                LastName = cp.User.LastName,
                Recipes = cp.User.Recipes.ToList(),
            })
            .FirstOrDefaultAsync();

        if (profile == null)
            return NotFound();

        return Ok(profile);
    }


    //UPDATE profile. When a user edits their profile, the endpoint accepts an UpdateChefProfileDto object containing the updated information.
    //The profile is updated with the new information, including handling profile image updates by deleting the old image and saving the new one.
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateChefProfileDto dto)
    {

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var profile = await _context.ChefProfiles
            .FirstOrDefaultAsync(cp => cp.UserId == userId);

        if (profile == null)
            return NotFound();

        if (dto.ProfessionalTitle != null)
            profile.ProfessionalTitle = dto.ProfessionalTitle;

        if (dto.Bio != null)
            profile.Bio = dto.Bio;

        profile.IsProfileVisible = dto.IsProfileVisible;
        profile.UpdatedAt = DateTime.Now;

        if (dto.ProfileImageURL != null)
        {
            if (!string.IsNullOrEmpty(profile.ProfileImageURL))
            {
                var filePath1 = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", profile.ProfileImageURL.TrimStart('/'));
                if (System.IO.File.Exists(filePath1))
                {
                    System.IO.File.Delete(filePath1);
                }
            }

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            var filename = Guid.NewGuid().ToString() + Path.GetExtension(dto.ProfileImageURL.FileName);
            var filePath = Path.Combine(folderPath, filename);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ProfileImageURL.CopyToAsync(stream);
            }
            profile.ProfileImageURL = "/images/" + filename;
        }


        await _context.SaveChangesAsync();

        return Ok(new
        { 
            profile.ProfessionalTitle,
            profile.Bio,
            profile.ProfileImageURL,
            profile.CreatedAt,
            profile.UpdatedAt
        });
    }


    // Each chef can delete only their own profile , and this action will also cascade delete all associated recipes, specializations, and certifications.
    [HttpDelete]
    public async Task<IActionResult> DeleteProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var profile = await _context.ChefProfiles
            .FirstOrDefaultAsync(cp => cp.UserId == userId);

        if (profile == null)
            return NotFound();

        if (!string.IsNullOrEmpty(profile.ProfileImageURL))
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", profile.ProfileImageURL.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _context.ChefProfiles.Remove(profile);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile deleted" });
    }
}