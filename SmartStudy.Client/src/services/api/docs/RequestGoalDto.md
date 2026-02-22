# RequestGoalDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**unit** | **string** |  | [default to undefined]
**targetValue** | [**RequestGoalDtoTargetValue**](RequestGoalDtoTargetValue.md) |  | [default to undefined]
**currentValue** | [**RequestGoalDtoCurrentValue**](RequestGoalDtoCurrentValue.md) |  | [default to undefined]
**type** | **number** |  | [default to undefined]
**learningPathId** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]

## Example

```typescript
import { RequestGoalDto } from './api';

const instance: RequestGoalDto = {
    name,
    unit,
    targetValue,
    currentValue,
    type,
    learningPathId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
