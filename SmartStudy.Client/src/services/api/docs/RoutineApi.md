# RoutineApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiRoutinesGet**](#apiroutinesget) | **GET** /api/routines | |
|[**apiRoutinesIdDelete**](#apiroutinesiddelete) | **DELETE** /api/routines/{id} | |
|[**apiRoutinesIdGenerateTasksPost**](#apiroutinesidgeneratetaskspost) | **POST** /api/routines/{id}/generate-tasks | |
|[**apiRoutinesIdGet**](#apiroutinesidget) | **GET** /api/routines/{id} | |
|[**apiRoutinesIdPatch**](#apiroutinesidpatch) | **PATCH** /api/routines/{id} | |
|[**apiRoutinesIdUpcomingTasksGet**](#apiroutinesidupcomingtasksget) | **GET** /api/routines/{id}/upcoming-tasks | |
|[**apiRoutinesPost**](#apiroutinespost) | **POST** /api/routines | |

# **apiRoutinesGet**
> Array<ResponseRoutineDto> apiRoutinesGet()


### Example

```typescript
import {
    RoutineApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

const { status, data } = await apiInstance.apiRoutinesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ResponseRoutineDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiRoutinesIdDelete**
> apiRoutinesIdDelete()


### Example

```typescript
import {
    RoutineApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

let id: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiRoutinesIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiRoutinesIdGenerateTasksPost**
> apiRoutinesIdGenerateTasksPost()


### Example

```typescript
import {
    RoutineApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

let id: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let upToDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiRoutinesIdGenerateTasksPost(
    id,
    upToDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|
| **upToDate** | [**string**] |  | (optional) defaults to undefined|


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

# **apiRoutinesIdGet**
> ResponseRoutineDto apiRoutinesIdGet()


### Example

```typescript
import {
    RoutineApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

let id: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiRoutinesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseRoutineDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiRoutinesIdPatch**
> ResponseRoutineDto apiRoutinesIdPatch(requestRoutineDto)


### Example

```typescript
import {
    RoutineApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestRoutineDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

let id: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestRoutineDto: RequestRoutineDto; //

const { status, data } = await apiInstance.apiRoutinesIdPatch(
    id,
    requestRoutineDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestRoutineDto** | **RequestRoutineDto**|  | |
| **id** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseRoutineDto**

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

# **apiRoutinesIdUpcomingTasksGet**
> Array<ResponseTaskDto> apiRoutinesIdUpcomingTasksGet()


### Example

```typescript
import {
    RoutineApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    ApiRoutinesIdUpcomingTasksGetDaysAheadParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

let id: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let daysAhead: ApiRoutinesIdUpcomingTasksGetDaysAheadParameter; // (optional) (default to 7)

const { status, data } = await apiInstance.apiRoutinesIdUpcomingTasksGet(
    id,
    daysAhead
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|
| **daysAhead** | [**ApiRoutinesIdUpcomingTasksGetDaysAheadParameter**] |  | (optional) defaults to 7|


### Return type

**Array<ResponseTaskDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiRoutinesPost**
> ResponseRoutineDto apiRoutinesPost(requestRoutineDto)


### Example

```typescript
import {
    RoutineApi,
    Configuration,
    RequestRoutineDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RoutineApi(configuration);

let requestRoutineDto: RequestRoutineDto; //

const { status, data } = await apiInstance.apiRoutinesPost(
    requestRoutineDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestRoutineDto** | **RequestRoutineDto**|  | |


### Return type

**ResponseRoutineDto**

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

