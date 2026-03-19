# Plan Template Feature — Frontend

## Context
SmartStudy app. Admin can create plan templates from existing StudyPlans.
Students can browse public templates and clone them.

## Existing code to reuse
- StudyPlanLayout.tsx + PlanOverviewTab.tsx → reuse for admin template creation
- DataTable.tsx → reuse for admin template management table
- useAdminDialogStore.ts → extend for template dialogs
- GlobalDialog.tsx pattern → add PLAN_TEMPLATE dialogs
- UserManagementPage.tsx → use as reference pattern for admin table page

## API types (from heyapi gen @/services/api)
- PlanTemplateDto: { id, name, description, isPublic, createdAt, createdByName, courseCount, routineCount, durationDays, sourceplanId }
- PlanTemplateDetailDto extends PlanTemplateDto: { payload: TemplatePayload }
- TemplatePayload: { durationDays, courses: TemplateCourse[] }
- TemplateCourse: { name, goal, targetScore, routines: TemplateRoutine[] }
- TemplateRoutine: { name, type, instructor, startDayOffset, endDayOffset, schedules: TemplateSchedule[] }
- CloneTemplateDto: { templateId, name?, startDate }
- CreatePlanTemplateDto: { sourcePlanId, name?, description?, isPublic }

## Pages to create

### 1. TemplateGalleryPage — /app/templates
Student browse public templates
- Search input (debounced)
- Grid of TemplateCard components
- Each card: name, description, courseCount, routineCount, durationDays badge
- Click card → navigate to /app/templates/:id
- Use useGetPlanTemplates hook

### 2. TemplateDetailPage — /app/templates/:id  
Preview before clone. Shared between student and admin.
- Header: name, description, createdBy, durationDays
- Course list with accordion — expand to see routines + schedules
- Each routine shows: name, type, instructor, frequency (schedules summary)
- "Dùng template này" button → opens CloneTemplateDialog
- CloneTemplateDialog: name input (pre-filled) + date picker for startDate
  → POST clone → navigate to new studyPlan

### 3. AdminTemplatePage — /admin/templates
Admin manage all templates (DataTable pattern like UserManagementPage)
- Search + pagination
- Columns: name | courses | routines | duration | status (public/private) | createdBy | actions
- Actions: Toggle publish, Edit (name/description), Delete, View detail
- "+ Tạo từ kế hoạch" button → opens SelectPlanDialog
  → show list of admin's StudyPlans → select → POST create template

## Dialogs to add to GlobalDialog.tsx
PLAN_TEMPLATE_CLONE: CloneTemplateDto fields (name, startDate)
PLAN_TEMPLATE_EDIT: UpdatePlanTemplateDto (name, description, isPublic)
PLAN_TEMPLATE_SELECT_PLAN: list admin StudyPlans to pick source

## Hooks to create (@/hooks/entities/usePlanTemplate.ts)
- useGetPlanTemplates(params) → GET /api/plan-templates
- useGetPlanTemplateById(id) → GET /api/plan-templates/:id
- useCreatePlanTemplate → POST /api/plan-templates
- useUpdatePlanTemplate → PUT /api/plan-templates/:id
- useDeletePlanTemplate → DELETE /api/plan-templates/:id
- useTogglePublish → PATCH /api/plan-templates/:id/toggle-publish
- useCloneTemplate → POST /api/plan-templates/clone

## Routes to add in index.tsx
# Student
{ path: "templates", element: <TemplateGalleryPage /> }
{ path: "templates/:templateId", element: <TemplateDetailPage /> }

# Admin  
{ path: "templates", element: <AdminTemplatePage /> }
{ path: "templates/:templateId", element: <TemplateDetailPage /> } ← reuse same page

## Key reuse strategy
- TemplateDetailPage used by BOTH student (/app/templates/:id) 
  and admin (/admin/templates/:id)
- Show "Dùng template" button only for student role
- Show "Chỉnh sửa" button only for admin role
- Detect role from useCurrentUser hook

## Style reference
- Follow existing shadcn/ui patterns in codebase
- Card grid like PlanOverviewTab course grid
- Table like UserManagementPage
- Use Badge for status pills (public/private)
- Use Skeleton for loading states
- Toast via sonner on success/error

## Do NOT create
- Admin UI for building template from scratch (admin uses student UI to create StudyPlan first)
- Complex template versioning
- Template categories/tags (out of scope)