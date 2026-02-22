# ResponseTaskDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**dueDate** | **string** |  | [default to undefined]
**completedAt** | **string** |  | [default to undefined]
**startAt** | **string** |  | [default to undefined]
**endAt** | **string** |  | [default to undefined]
**type** | **number** |  | [default to undefined]
**status** | **number** |  | [default to undefined]
**log** | [**ResponseLogDto**](ResponseLogDto.md) |  | [default to undefined]
**routineId** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]
**goalId** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]
**gradeId** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]

## Example

```typescript
import { ResponseTaskDto } from './api';

const instance: ResponseTaskDto = {
    id,
    name,
    description,
    dueDate,
    completedAt,
    startAt,
    endAt,
    type,
    status,
    log,
    routineId,
    goalId,
    gradeId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
