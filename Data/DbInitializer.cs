using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; // Потрібно для FirstOrDefaultAsync
using OpenSpotify.API.Entities;

namespace OpenSpotify.API.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(IApplicationBuilder app, IConfiguration config)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Створюємо ролі
            string[] roleNames = { "Admin", "Artist", "User" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
            
            // Створюємо адміна
            var adminUsername = config["AdminUser:Username"];
            var adminEmail = config["AdminUser:Email"];
            var adminPassword = config["AdminUser:Password"];

            if (!string.IsNullOrEmpty(adminUsername) && 
                !string.IsNullOrEmpty(adminEmail) && 
                !string.IsNullOrEmpty(adminPassword))
            {
                if (await userManager.FindByNameAsync(adminUsername) == null)
                {
                    var admin = new ApplicationUser { UserName = adminUsername, Email = adminEmail };
                    var result = await userManager.CreateAsync(admin, adminPassword);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(admin, "Admin");
                    }
                }
            }

            // --- НОВИЙ БЛОК: СІЄМО МУЗИЧНИЙ КОНТЕНТ ---
            await SeedMusicData(context);
        }

        private static async Task SeedMusicData(ApplicationDbContext context)
        {
            if (await context.Artists.AnyAsync())
            {
                return;
            }

            // Test music from chatgpt
            // I don't listen music
            var artist1 = new Artist { Name = "The Midnight", Bio = "A synthwave band from Los Angeles.", IsVerified = true, ProfileImageUrl = "https://example.com/the_midnight.jpg" };
            var artist2 = new Artist { Name = "Carpenter Brut", Bio = "A French synthwave artist from Poitiers.", IsVerified = true, ProfileImageUrl = "https://example.com/carpenter_brut.jpg" };
            var artist3 = new Artist { Name = "Daft Punk", Bio = "A legendary French electronic music duo.", IsVerified = false, ProfileImageUrl = "https://example.com/daft_punk.jpg" };

            var album1 = new Album { Title = "Endless Summer", Artist = artist1, CoverImageUrl = "https://i.scdn.co/image/ab67616d0000b273e911a71b3c323f46f3a38ac2" };
            var album2 = new Album { Title = "Kids", Artist = artist1, CoverImageUrl = "https://i.scdn.co/image/ab67616d0000b273d406ecf5c53f4a08c02c6bee" };
            var album3 = new Album { Title = "Trilogy", Artist = artist2, CoverImageUrl = "https://i.scdn.co/image/ab67616d0000b27393433604b9045f7c3275b28d" };
            var album4 = new Album { Title = "Discovery", Artist = artist3, CoverImageUrl = "https://i.scdn.co/image/ab67616d0000b273bde3390a35f299f2430263f3" };

            var tracks = new List<Track>
            {
                new Track { Title = "Endless Summer", DurationInSeconds = 403, Album = album1 },
                new Track { Title = "Sunset", DurationInSeconds = 323, Album = album1 },
                new Track { Title = "Daytona", DurationInSeconds = 297, Album = album1 },
                new Track { Title = "Lost Boy", DurationInSeconds = 277, Album = album2 },
                new Track { Title = "Kids (Prelude)", DurationInSeconds = 137, Album = album2 },
                new Track { Title = "America 2", DurationInSeconds = 241, Album = album2 },
                new Track { Title = "Turbo Killer", DurationInSeconds = 209, Album = album3 },
                new Track { Title = "Le Perv", DurationInSeconds = 258, Album = album3 },
                new Track { Title = "Maniac", DurationInSeconds = 270, Album = album3 },
                new Track { Title = "One More Time", DurationInSeconds = 320, Album = album4 },
                new Track { Title = "Aerodynamic", DurationInSeconds = 207, Album = album4 },
                new Track { Title = "Harder, Better, Faster, Stronger", DurationInSeconds = 224, Album = album4 }
            };
            
            await context.Artists.AddRangeAsync(artist1, artist2, artist3);
            await context.Albums.AddRangeAsync(album1, album2, album3, album4);
            await context.Tracks.AddRangeAsync(tracks);
            
            await context.SaveChangesAsync();
        }
    }
}