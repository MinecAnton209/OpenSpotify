namespace OpenSpotify.API.DTOs
{
    public class PlaylistDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string OwnerName { get; set; } = null!;
        public List<TrackDto> Tracks { get; set; } = new();
    }
}