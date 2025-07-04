﻿namespace OpenSpotify.API.Entities
{
    public class PlaylistTrack
    {
        public int PlaylistId { get; set; }
        public Playlist Playlist { get; set; } = null!;

        public int TrackId { get; set; }
        public Track Track { get; set; } = null!;

        public DateTime AddedAt { get; set; }
    }
}