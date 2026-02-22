# ResponseRoutineDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**startDate** | **string** |  | [default to undefined]
**endDate** | **string** |  | [default to undefined]
**schedules** | [**Array&lt;ScheduleDto&gt;**](ScheduleDto.md) |  | [default to undefined]
**goalId** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]
**gradeId** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]
**tasks** | [**Array&lt;ResponseTaskDto&gt;**](ResponseTaskDto.md) |  | [default to undefined]

## Example

```typescript
import { ResponseRoutineDto } from './api';

const instance: ResponseRoutineDto = {
    id,
    name,
    description,
    startDate,
    endDate,
    schedules,
    goalId,
    gradeId,
    tasks,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
