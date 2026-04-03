using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class EventDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimelineEvents_CourseId_DueDate",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "TimelineEvents");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDateTime",
                table: "TimelineEvents",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsAllDay",
                table: "TimelineEvents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDateTime",
                table: "TimelineEvents",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEvents_CourseId",
                table: "TimelineEvents",
                column: "CourseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimelineEvents_CourseId",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "EndDateTime",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "IsAllDay",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "StartDateTime",
                table: "TimelineEvents");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "TimelineEvents",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEvents_CourseId_DueDate",
                table: "TimelineEvents",
                columns: new[] { "CourseId", "DueDate" });
        }
    }
}
