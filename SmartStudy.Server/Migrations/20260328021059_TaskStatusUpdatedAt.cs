using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class TaskStatusUpdatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StatusUpdatedAt",
                table: "Tasks",
                type: "timestamp without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusUpdatedAt",
                table: "Tasks");
        }
    }
}
