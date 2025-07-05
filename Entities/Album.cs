namespace OpenSpotify.API.Entities
{
    public class Album
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        
        public Guid ArtistId { get; set; }
        public Artist Artist { get; set; } = null!;

        public List<Track> Tracks { get; set; } = new();
    }
}