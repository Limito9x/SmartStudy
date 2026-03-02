# ResponseCourseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**semesterId** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**credits** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**targetGrade** | [**RequestGoalDtoTargetValue**](RequestGoalDtoTargetValue.md) |  | [default to undefined]
**currentGPA** | [**ResponseCourseDtoCurrentGPA**](ResponseCourseDtoCurrentGPA.md) |  | [default to undefined]
**grades** | [**Array&lt;ResponseGradeDto&gt;**](ResponseGradeDto.md) |  | [default to undefined]

## Example

```typescript
import { ResponseCourseDto } from './api';

const instance: ResponseCourseDto = {
    id,
    name,
    description,
    semesterId,
    credits,
    targetGrade,
    currentGPA,
    grades,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
