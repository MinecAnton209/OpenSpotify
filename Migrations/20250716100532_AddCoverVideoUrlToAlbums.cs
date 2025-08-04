using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenSpotify.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverVideoUrlToAlbums : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverVideoUrl",
                table: "Albums",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverVideoUrl",
                table: "Albums");
        }
    }
}
