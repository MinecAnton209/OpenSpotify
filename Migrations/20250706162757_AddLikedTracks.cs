using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OpenSpotify.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLikedTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LikedTracks",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    TrackId = table.Column<Guid>(type: "uuid", nullable: false),
                    LikedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LikedTracks", x => new { x.UserId, x.TrackId });
                    table.ForeignKey(
                        name: "FK_LikedTracks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LikedTracks_Tracks_TrackId",
                        column: x => x.TrackId,
                        principalTable: "Tracks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LikedTracks_TrackId",
                table: "LikedTracks",
                column: "TrackId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LikedTracks");
        }
    }
}
