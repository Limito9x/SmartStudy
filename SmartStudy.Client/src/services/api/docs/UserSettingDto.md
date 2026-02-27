# UserSettingDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**admissionDate** | **string** |  | [default to undefined]
**semestersPerYear** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**weeksPerSemester** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**weeksOfSummerSemester** | [**RequestLogDtoTimeSpent**](RequestLogDtoTimeSpent.md) |  | [default to undefined]
**programLength** | [**RequestGoalDtoTargetValue**](RequestGoalDtoTargetValue.md) |  | [default to undefined]
**semesters** | [**Array&lt;RequestSemesterDto&gt;**](RequestSemesterDto.md) |  | [default to undefined]

## Example

```typescript
import { UserSettingDto } from './api';

const instance: UserSettingDto = {
    admissionDate,
    semestersPerYear,
    weeksPerSemester,
    weeksOfSummerSemester,
    programLength,
    semesters,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
