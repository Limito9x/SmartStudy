# GoalApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiGoalsGoalIdDelete**](#apigoalsgoaliddelete) | **DELETE** /api/goals/{GoalId} | |
|[**apiGoalsGoalIdPatch**](#apigoalsgoalidpatch) | **PATCH** /api/goals/{GoalId} | |
|[**apiGoalsPost**](#apigoalspost) | **POST** /api/goals | |

# **apiGoalsGoalIdDelete**
> apiGoalsGoalIdDelete()


### Example

```typescript
import {
    GoalApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new GoalApi(configuration);

let goalId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiGoalsGoalIdDelete(
    goalId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **goalId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiGoalsGoalIdPatch**
> ResponseGoalDto apiGoalsGoalIdPatch(requestGoalDto)


### Example

```typescript
import {
    GoalApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestGoalDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GoalApi(configuration);

let goalId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestGoalDto: RequestGoalDto; //

const { status, data } = await apiInstance.apiGoalsGoalIdPatch(
    goalId,
    requestGoalDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestGoalDto** | **RequestGoalDto**|  | |
| **goalId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseGoalDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiGoalsPost**
> ResponseGoalDto apiGoalsPost(requestGoalDto)


### Example

```typescript
import {
    GoalApi,
    Configuration,
    RequestGoalDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GoalApi(configuration);

let requestGoalDto: RequestGoalDto; //

const { status, data } = await apiInstance.apiGoalsPost(
    requestGoalDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestGoalDto** | **RequestGoalDto**|  | |


### Return type

**ResponseGoalDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

