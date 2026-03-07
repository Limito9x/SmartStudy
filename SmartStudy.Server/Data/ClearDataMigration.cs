using Microsoft.EntityFrameworkCore.Migrations;

namespace SmartStudy.Server.Data
{
    public class ClearDataMigration: Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            //migrationBuilder.Sql("TRUNCATE TABLE \"Schedules\" CASCADE;");
            //migrationBuilder.Sql("TRUNCATE TABLE \"Courses\" CASCADE;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
