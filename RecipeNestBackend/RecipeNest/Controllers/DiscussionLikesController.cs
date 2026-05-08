using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeNest.Data;
using RecipeNest.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using RecipeNest.Models.DTOs;   


//This controller manages the like and unlike functionality for discussions. It alloss authenticated users to like and unlike discussions.
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DiscussionLikesController : ControllerBase
{
    private readonly RecipeNestDbContext _context;

    public DiscussionLikesController(RecipeNestDbContext context)
    {
        _context = context;
    }

    //LIKE discussion. The like endpoint is a POST request that registers the user's like for a specific discussion by creating a for each user on a particular discussion. It checks to prevent duplicates.
    [Authorize]
    [HttpPost("{id}")]
    public async Task<IActionResult> LikeDiscussion(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        //Validate that the discussion exists
        var discussionExists = await _context.Discussions
            .AnyAsync(d => d.DiscussionId == id);

        if (!discussionExists)
            return NotFound($"Discussion with ID {id} not found");

        // prevent duplicate likes
        var existingLike = await _context.DiscussionLikes
            .FirstOrDefaultAsync(dl => dl.UserId == userId && dl.DiscussionId == id);

        if (existingLike != null)
            return BadRequest("Already liked");

        var like = new DiscussionLikes
        {
            UserId = userId,
            DiscussionId = id,
            LikedAt = DateTime.UtcNow
        };

        _context.DiscussionLikes.Add(like);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Liked" });
    }


    // UNLIKE discussion. The unlike endpoint is a DELETE request that removes the user's like for a specific discussion by deleting the corresponding record from the database only if it exists. 
    [Authorize]
    [HttpDelete("{discussionId}")]
    public async Task<IActionResult> UnlikeDiscussion(int discussionId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var like = await _context.DiscussionLikes
            .FirstOrDefaultAsync(dl => dl.UserId == userId && dl.DiscussionId == discussionId);

        if (like == null)
            return NotFound();

        _context.DiscussionLikes.Remove(like);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Unliked" });
    }
}