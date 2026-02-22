# RequestTaskDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**dueDate** | **string** |  | [default to undefined]
**startAt** | **string** |  | [default to undefined]
**endAt** | **string** |  | [default to undefined]
**type** | **number** |  | [default to undefined]
**linkedFormIds** | [**Array&lt;ApiAssetsGetLinkedIdParameter&gt;**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**courseId** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]

## Example

```typescript
import { RequestTaskDto } from './api';

const instance: RequestTaskDto = {
    name,
    description,
    dueDate,
    startAt,
    endAt,
    type,
    linkedFormIds,
    courseId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
