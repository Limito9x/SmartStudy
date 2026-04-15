using System;
using System.Collections.Generic;
using Ical.Net.DataTypes;
using System.Text.Json.Serialization;
using SmartStudy.Server.Entities.Interfaces;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{

    // Sửa lại -> lặp lại theo tuần, để dễ tính toán và đồng nhất với lịch học truyền thống (thứ 2, thứ 3,...)
    public class Schedule: BaseEntity, IGraphSyncTrigger
    {
        public DayOfWeek DayOfWeek { get; set; } // Sửa lại thành một ngày trong tuần duy nhất để dễ tính và đồng nhất
        public TimeOnly? StartTime { get; set; }
        public int? Duration { get; set; }
        public string? Location { get; set; }
        public int? RoutineId { get; set; }
        public Routine? Routine { get; set; }
        public ICollection<TaskItem> Tasks { get; set; }

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Schedule;
        }
    }
}
