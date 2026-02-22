# ResponseGoalDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**unit** | **string** |  | [default to undefined]
**targetValue** | [**RequestGoalDtoTargetValue**](RequestGoalDtoTargetValue.md) |  | [default to undefined]
**currentValue** | [**RequestGoalDtoCurrentValue**](RequestGoalDtoCurrentValue.md) |  | [default to undefined]
**type** | **number** |  | [default to undefined]
**learningPathId** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**tasks** | [**Array&lt;SimpleResponseTaskDto&gt;**](SimpleResponseTaskDto.md) |  | [default to undefined]
**routines** | [**Array&lt;SimpleResponseRoutineDto&gt;**](SimpleResponseRoutineDto.md) |  | [default to undefined]

## Example

```typescript
import { ResponseGoalDto } from './api';

const instance: ResponseGoalDto = {
    id,
    name,
    unit,
    targetValue,
    currentValue,
    type,
    learningPathId,
    tasks,
    routines,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
