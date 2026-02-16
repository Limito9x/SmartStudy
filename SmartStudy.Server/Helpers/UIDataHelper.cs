using SmartStudy.Server.Dtos;

namespace SmartStudy.Server.Helpers
{
    public static class UIDataHelper
    {
        public static ConvertedSemesterData ToSemesterDto(SemesterUIData SemesterUIData)
        {
            var startDate = DateTime.UtcNow;

            var Courses = new List<ConvertedCourseData>();
            var currentCourseStartDate = startDate;

            foreach (var CourseUI in SemesterUIData.Courses)
            {
                var CourseEndDate = currentCourseStartDate.AddDays(CourseUI.DurationDays);

                Courses.Add(
                    new ConvertedCourseData
                    {
                        Title = CourseUI.Title,
                        Description = CourseUI.Description,
                        StartDate = currentCourseStartDate,
                        EndDate = CourseEndDate
                    }
                );

                currentCourseStartDate = CourseEndDate.AddDays(1);
            }

            var SemesterEndDate = Courses.Last().EndDate;

            return new ConvertedSemesterData
            {
                Title = SemesterUIData.Title,
                Description = SemesterUIData.Description,
                StartDate = startDate,
                EndDate = SemesterEndDate,
                Courses = Courses
            };
        }
    }
}
