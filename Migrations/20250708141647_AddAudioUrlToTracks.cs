using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenSpotify.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioUrlToTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AudioUrl",
                table: "Tracks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioUrl",
                table: "Tracks");
        }
    }
}
