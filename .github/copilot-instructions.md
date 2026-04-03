# SmartStudy Copilot Instructions

## Project Structure
- Backend: SmartStudy.Server (.NET 10, EF Core, PostgreSQL)
- Frontend: SmartStudy.Client (React 19, TypeScript, Vite, shadcn/ui, TanStack Query)

## Conventions
### Backend
- DTOs nằm trong Dtos/, Services trong Services/
- Sau khi thêm/sửa endpoint: chạy `dotnet build` để verify
- Entity dùng BaseEntity, soft delete qua IsDeleted

### Frontend  
- Sau khi BE thêm endpoint mới: chạy `npm run gen-api` trong SmartStudy.Client
- API client được gen bởi hey-api, KHÔNG viết tay fetch
- Component dùng shadcn/ui, style Tailwind only

## Workflow
1. Viết Entity → DTO → Service → Controller
2. Build BE xong → gen-api FE
3. Dùng TanStack Query, không dùng useEffect để fetch

## Terminal paths
- Backend terminal: cd D:\.NET\SmartStudy\SmartStudy.Server
- Frontend terminal: cd D:\.NET\SmartStudy\SmartStudy.Client
- ALWAYS cd to correct directory before running npm or dotnet commands
- npm commands → must be in SmartStudy.Client
- dotnet commands → must be in SmartStudy.Server

## Form Creation Workflow

When creating a new form, ALWAYS follow this exact structure:

### Step 1 — Schema (`/forms/{feature}/schema.ts`)
- Define Zod schema with validation rules
- Export inferred TypeScript type
```ts
export const taskFormSchema = z.object({ ... })
export type TaskFormValues = z.infer
```

### Step 2 — Form UI (`/forms/{feature}/{Feature}Form.tsx`)
- Receives `form: UseFormReturn<TaskFormValues>` as prop
- Uses shadcn/ui FormField, FormItem, FormLabel, FormControl
- Wraps with `<BaseForm>` from `/forms/base`
- NO logic, NO API calls — pure UI only

### Step 3 — Form Container (`/form-containers/{Feature}FormContainer.tsx`)
- Handles all logic:
  - Fetch existing data if update mode (useQuery by id)
  - Map API response → form values via mapper
  - useMutation (TanStack Query) for submit
  - onSuccess: toast + invalidateQueries + onClose/navigate
- Props: `id?` (undefined = create, number = update), `onSuccess?`, `onClose?`

### File naming convention
- Schema: `schema.ts`
- UI: `{Feature}Form.tsx`  
- Container: `{Feature}FormContainer.tsx`
- Folder: `/forms/{feature}/` (lowercase, kebab-case)

### Example invocation
When asked "create form for X", generate all 3 files in order.