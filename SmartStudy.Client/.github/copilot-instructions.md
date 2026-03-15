# SmartStudy Client — Copilot Context

## Stack
React + TypeScript, Tailwind CSS, shadcn/ui, 
React Query (TanStack), Zustand, heyapi gen (API types)

## Installed shadcn components
card, button, badge, skeleton, progress, sonner,
select, dropdown-menu, tabs, dialog, input, textarea

## API Types
Luôn import types từ "@/services/api" (heyapi gen)
Không tự định nghĩa lại type đã có

## Conventions
- Toast: import { toast } from "sonner"
- Global dialog (multi-trigger): Zustand store
- Local dialog (single component): useState
- Loading state: Skeleton từ shadcn
- API calls: React Query hooks trong @/hooks/entities/

## Domain enums
TaskType: ClassSession | SelfStudy | AssignmentWork | Meeting
TaskStatus: Pending | InProgress | Completed | Cancelled
CourseStatus: Enrolled | Completed | Dropped
EventType: Exam | Assignment | Presentation | ProjectDeadline | Other
PriorityLevel: Low | Medium | High

## Action button theo TaskType
ClassSession   → "Ghi lại buổi học"
SelfStudy      → "Bắt đầu học"  
AssignmentWork → "Hoàn thành"
Meeting        → "Đã tham dự"

## Current focus: Dashboard "Hôm nay"
DashboardSummaryDto fields:
- weeklyStudyHours, weeklyProductivity
- hoursDelta, productivityDelta (so tuần trước, có thể âm)
- weeklyCompletionRate
- daysLeftInPlan, currentPlanName
- todayTasks: TodayTaskDto[]
- overdueTasks: TodayTaskDto[]  
- upcomingEvents: UpcomingEventDto[]
```
