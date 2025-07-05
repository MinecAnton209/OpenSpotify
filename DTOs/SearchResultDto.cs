namespace OpenSpotify.API.DTOs
{
    public class SearchResultDto
    {
        public List<ArtistDto> Artists { get; set; } = new();
        public List<AlbumDto> Albums { get; set; } = new();
        public List<TrackDto> Tracks { get; set; } = new();
    }
}