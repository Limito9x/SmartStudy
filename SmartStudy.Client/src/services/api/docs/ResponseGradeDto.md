# ResponseGradeDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**actualScore** | [**ResponseGradeDtoActualScore**](ResponseGradeDtoActualScore.md) |  | [default to undefined]
**weight** | [**ResponseGradeDtoWeight**](ResponseGradeDtoWeight.md) |  | [default to undefined]
**maxScale** | [**ResponseGradeDtoWeight**](ResponseGradeDtoWeight.md) |  | [default to undefined]
**courseId** | [**ApiAssetsGetLinkedIdParameter**](ApiAssetsGetLinkedIdParameter.md) |  | [default to undefined]
**tasks** | [**Array&lt;SimpleResponseTaskDto&gt;**](SimpleResponseTaskDto.md) |  | [default to undefined]
**routines** | [**Array&lt;SimpleResponseRoutineDto&gt;**](SimpleResponseRoutineDto.md) |  | [default to undefined]

## Example

```typescript
import { ResponseGradeDto } from './api';

const instance: ResponseGradeDto = {
    id,
    name,
    actualScore,
    weight,
    maxScale,
    courseId,
    tasks,
    routines,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
