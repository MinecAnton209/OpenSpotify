using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenSpotify.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCanvasVideoUrlToTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CanvasVideoUrl",
                table: "Tracks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CanvasVideoUrl",
                table: "Tracks");
        }
    }
}
