namespace OpenSpotify.API.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public IList<string> Roles { get; set; } = new List<string>();
    }
}