namespace OpenSpotify.API.Entities
{
    public class LikedTrack
    {
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        
        public Guid TrackId { get; set; }
        public Track Track { get; set; } = null!;
        
        public DateTime LikedAt { get; set; }
    }
}