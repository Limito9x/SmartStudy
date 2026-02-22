# ScheduleDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**frequency** | **number** |  | [default to undefined]
**interval** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**daysOfWeek** | **Array&lt;number&gt;** |  | [default to undefined]
**daysOfMonth** | [**Array&lt;ApiAssetsGetLinkedIdParameter&gt;**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**startTime** | **string** |  | [default to undefined]
**duration** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**durationUnit** | **number** |  | [default to undefined]
**location** | **string** |  | [default to undefined]

## Example

```typescript
import { ScheduleDto } from './api';

const instance: ScheduleDto = {
    id,
    frequency,
    interval,
    daysOfWeek,
    daysOfMonth,
    startTime,
    duration,
    durationUnit,
    location,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
