# ResponseLogDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**note** | **string** |  | [default to undefined]
**timeSpent** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]
**comrehensiveLevel** | **number** |  | [default to undefined]
**difficultyLevel** | **number** |  | [default to undefined]
**goalContributionValue** | [**RequestGoalDtoCurrentValue**](RequestGoalDtoCurrentValue.md) |  | [default to undefined]
**artifats** | **Array&lt;string&gt;** |  | [default to undefined]
**completedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { ResponseLogDto } from './api';

const instance: ResponseLogDto = {
    id,
    note,
    timeSpent,
    comrehensiveLevel,
    difficultyLevel,
    goalContributionValue,
    artifats,
    completedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
