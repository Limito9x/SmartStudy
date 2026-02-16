namespace SmartStudy.Server.Dtos
{
    public record RequestGradeDto
    (
        string Name,
        double Score,
        double Weight
    );

    public record ResponseGradeDto
    (
        int Id,
        string Name,
        double? ActualScore,
        double Weight,
        double MaxScale,
        int CourseId,
        List<SimpleResponseTaskDto>? Tasks,
        List<SimpleResponseRoutineDto>? Routines
    );
}
