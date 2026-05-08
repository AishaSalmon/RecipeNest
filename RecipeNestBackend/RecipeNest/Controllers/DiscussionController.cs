using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeNest.Data;
using RecipeNest.Models;
using RecipeNest.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


// This controller manages CRUD operations related to discussions, allowing authenticated users to create, read and delete discussions.
// Each discussion is only accessible to its owner for update and delete.
[Route("api/[controller]")]
[ApiController]
public class DiscussionController : ControllerBase
{
    private readonly RecipeNestDbContext _context;

    public DiscussionController(RecipeNestDbContext context)
    {
        _context = context;
    }

    //CREATE discussion. The endpoing accepts the CreateDiscussionDTO contaning the title, description and the userId is extracted from the JWT token. 
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateDiscussion(CreateDiscussionDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var discussion = new Discussion
        {
            DiscussionTitle = dto.DiscussionTitle,
            DiscussionDescription = dto.DiscussionDescription,
            CreatedAt = DateTime.Now,
            UserId = userId
        };

        _context.Discussions.Add(discussion);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Discussion created", id = discussion.DiscussionId });
    }


    //GET all discussions. The endpoint returns a list of discussions with their title, description and the number of likes.
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetDiscussions()
    {
        var discussions = await _context.Discussions
            .Select(d => new DiscussionDto
            {
                DiscussionId = d.DiscussionId,
                DiscussionTitle = d.DiscussionTitle,
                DiscussionDescription = d.DiscussionDescription,
                LikesCount = d.DiscussionLikes.Count,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                ProfileImageURL = d.User.ChefProfile.ProfileImageURL,
                ProfessionalTitle = d.User.ChefProfile.ProfessionalTitle,
            })
            .ToListAsync();

        return Ok(discussions);
    }


    // GET discussion by id. The endpoint returns the details of a specific discussion, but only if the user is the owner of the discussion.
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDiscussionByUserId(int id)
    {
        var discussion = await _context.Discussions
            .Where(d => d.DiscussionId == id)
            .Select(d => new DiscussionDto
            {
                DiscussionId = d.DiscussionId,
                DiscussionTitle = d.DiscussionTitle,
                DiscussionDescription = d.DiscussionDescription,
                LikesCount = d.DiscussionLikes.Count,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                ProfileImageURL = d.User.ChefProfile.ProfileImageURL,
                ProfessionalTitle = d.User.ChefProfile.ProfessionalTitle,
            })
            .FirstOrDefaultAsync();

        if (discussion == null)
            return NotFound();

        return Ok(discussion);
    }


    //DELETE discussion (only owner). The endpoint checks if the discussion exists and if the authenticated user is the owner before deleting it from the database.
    //This controller does not allow users to update discussions.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDiscussion(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var discussion = await _context.Discussions
            .FirstOrDefaultAsync(d => d.DiscussionId == id);

        if (discussion == null)
            return NotFound();

        if (discussion.UserId != userId)
            return Forbid();

        _context.Discussions.Remove(discussion);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Discussion deleted" });
    }
}