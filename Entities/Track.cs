namespace OpenSpotify.API.Entities
{
    public class Track
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public int DurationInSeconds { get; set; }
        
        public string? AudioUrl { get; set; }
        public string? CanvasVideoUrl { get; set; }

        public Guid AlbumId { get; set; }
        public Album Album { get; set; } = null!;

        public List<PlaylistTrack> PlaylistTracks { get; set; } = new();
    }
}