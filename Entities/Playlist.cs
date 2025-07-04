namespace OpenSpotify.API.Entities
{
    public class Playlist
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;

        public List<PlaylistTrack> PlaylistTracks { get; set; } = new();
    }
}