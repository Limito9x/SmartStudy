# ResponseSemesterDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**progress** | [**ResponseSemesterDtoProgress**](ResponseSemesterDtoProgress.md) |  | [default to undefined]
**startDate** | **string** |  | [default to undefined]
**endDate** | **string** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**status** | [**SemesterStatus**](SemesterStatus.md) |  | [default to undefined]
**courses** | [**Array&lt;SimpleResponseCourseDto&gt;**](SimpleResponseCourseDto.md) |  | [default to undefined]

## Example

```typescript
import { ResponseSemesterDto } from './api';

const instance: ResponseSemesterDto = {
    id,
    name,
    description,
    progress,
    startDate,
    endDate,
    createdAt,
    updatedAt,
    status,
    courses,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
