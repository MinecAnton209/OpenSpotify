namespace OpenSpotify.API.Entities
{
    public class Track
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public int DurationInSeconds { get; set; }

        public int AlbumId { get; set; }
        public Album Album { get; set; } = null!;

        public List<PlaylistTrack> PlaylistTracks { get; set; } = new();
    }
}