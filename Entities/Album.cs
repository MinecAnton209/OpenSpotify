namespace OpenSpotify.API.Entities
{
    public class Album
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        
        public int ArtistId { get; set; }
        public Artist Artist { get; set; } = null!;

        public List<Track> Tracks { get; set; } = new();
    }
}