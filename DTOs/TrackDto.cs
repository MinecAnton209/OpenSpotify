namespace OpenSpotify.API.DTOs
{
    public class TrackDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public int DurationInSeconds { get; set; }
    }
}