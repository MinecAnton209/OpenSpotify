// Data/ApplicationDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OpenSpotify.API.Entities;

namespace OpenSpotify.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Artist> Artists { get; set; }
        public DbSet<Album> Albums { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistTrack> PlaylistTracks { get; set; }
        public DbSet<LikedTrack> LikedTracks { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Artist>()
                .HasMany(artist => artist.Albums)
                .WithOne(album => album.Artist)
                .HasForeignKey(album => album.ArtistId)
                .IsRequired();

            builder.Entity<Album>()
                .HasMany(album => album.Tracks)
                .WithOne(track => track.Album)
                .HasForeignKey(track => track.AlbumId)
                .IsRequired();        

            builder.Entity<ApplicationUser>()
                .HasMany<Playlist>()
                .WithOne(playlist => playlist.User)
                .HasForeignKey(playlist => playlist.UserId)
                .IsRequired();

            builder.Entity<PlaylistTrack>()
                .HasKey(pt => new { pt.PlaylistId, pt.TrackId });

            builder.Entity<PlaylistTrack>()
                .HasOne(pt => pt.Playlist)
                .WithMany(p => p.PlaylistTracks)
                .HasForeignKey(pt => pt.PlaylistId);

            builder.Entity<PlaylistTrack>()
                .HasOne(pt => pt.Track)
                .WithMany(t => t.PlaylistTracks)
                .HasForeignKey(pt => pt.TrackId);
            
            builder.Entity<LikedTrack>()
                .HasKey(lt => new { lt.UserId, lt.TrackId });
            
            builder.Entity<LikedTrack>()
               .HasOne(lt => lt.User)
               .WithMany()
               .HasForeignKey(lt => lt.UserId);
            
            builder.Entity<LikedTrack>()
                .HasOne(lt => lt.Track)
                .WithMany()
                .HasForeignKey(lt => lt.TrackId);
        }
    }
}