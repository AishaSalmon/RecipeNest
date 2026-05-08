using Microsoft.EntityFrameworkCore;
using RecipeNest.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

//THe recipenest project is a web application designed to connect food enthusiasts, home cooks, and professional chefs through a platform where they can share recipes, culinary experiences, and engage in discussions about food.
namespace RecipeNest.Data
{
    //The recipeNestDbContext class is the bridge between our application and the database.
    //It inherits from IdentityDbContext<User>, which means it includes all the necessary tables and configurations for user authentication and management provided by ASP.NET Core Identity.
    public class RecipeNestDbContext : IdentityDbContext<User>
    {
        public RecipeNestDbContext(DbContextOptions<RecipeNestDbContext> options) : base(options)
        {
        }

        //After the default identity identity tables are created as default by the Identity class, DbSet properties for our custom entities like ChefProfile, Specialization, Recipe, are defined and created.
        //public DbSet<User> User { get; set; }
        public DbSet<ChefProfile> ChefProfiles { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
        public DbSet<SavedRecipe> SavedRecipes { get; set; }
        public DbSet<Discussion> Discussions { get; set; }
        public DbSet<DiscussionLikes> DiscussionLikes { get; set; }


        //The OnModelCreating method is called to override the default database creation behaviour and establish specifically defined relationships and cascade delete behaviors between entities.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Here, the relationship between user and discussion likes is one to many.
            //It states that a user can have many discussion likes but a discussion like can only belong to one user but when a user is deleted, the discussion likes associated with that user will not be deleted but will have their foreign key set to null.
            modelBuilder.Entity<DiscussionLikes>()
                .HasOne(dl => dl.User)
                .WithMany(u => u.DiscussionLikes)
                .HasForeignKey(dl => dl.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            //However, when the discussion is deleted, all associated discussion likes will also be deleted due to the cascade delete behavior defined here.
            modelBuilder.Entity<DiscussionLikes>()
                .HasOne(dl => dl.Discussion)
                .WithMany(d => d.DiscussionLikes)
                .HasForeignKey(dl => dl.DiscussionId)
                .OnDelete(DeleteBehavior.Cascade);


            //Here the relation ship between user and saved recipe is one to many.
            //It states that a user can have many saved recipes but a saved recipe can only belong to one user but when a user is deleted, the saved recipe of that user would not be deleted.
            modelBuilder.Entity<SavedRecipe>()
                .HasOne(sr => sr.User)
                .WithMany(u => u.SavedRecipes)
                .HasForeignKey(sr => sr.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            //However, when a recipe is deleted, all associated saved recipes will also be deleted due to the cascade delete behavior defined here.
            modelBuilder.Entity<SavedRecipe>()
                .HasOne(sr => sr.Recipe)
                .WithMany(r => r.SavedRecipes)
                .HasForeignKey(sr => sr.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);


            //Here, the relationship between user and chef profile is one to one.
            modelBuilder.Entity<ChefProfile>()
                .HasOne(cp => cp.User)
                .WithOne(u => u.ChefProfile)
                .HasForeignKey<ChefProfile>(cp => cp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        //SaveChangesAsync is used to automatically update the UpdatedAt timestamp for User entities whenever they are updated or edited.
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<User>())
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.Now;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
