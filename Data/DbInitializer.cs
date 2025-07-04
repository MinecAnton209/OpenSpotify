using Microsoft.AspNetCore.Identity;
using OpenSpotify.API.Entities;

namespace OpenSpotify.API.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(IApplicationBuilder app, IConfiguration config)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string[] roleNames = { "Admin", "Artist", "User" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
            var adminUsername = config["AdminUser:Username"];
            var adminEmail = config["AdminUser:Email"];
            var adminPassword = config["AdminUser:Password"];

            if (string.IsNullOrEmpty(adminUsername) || 
                string.IsNullOrEmpty(adminEmail) || 
                string.IsNullOrEmpty(adminPassword))
            {
                return;
            }

            if (await userManager.FindByNameAsync(adminUsername) == null)
            {
                var admin = new ApplicationUser 
                { 
                    UserName = adminUsername, 
                    Email = adminEmail 
                };
                
                var result = await userManager.CreateAsync(admin, adminPassword);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
    }
}