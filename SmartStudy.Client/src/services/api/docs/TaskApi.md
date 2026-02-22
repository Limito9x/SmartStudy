# TaskApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiTasksPost**](#apitaskspost) | **POST** /api/tasks | |
|[**apiTasksTaskIdDelete**](#apitaskstaskiddelete) | **DELETE** /api/tasks/{taskId} | |
|[**apiTasksTaskIdExecutePost**](#apitaskstaskidexecutepost) | **POST** /api/tasks/{taskId}/execute | |
|[**apiTasksTaskIdGet**](#apitaskstaskidget) | **GET** /api/tasks/{taskId} | |
|[**apiTasksTaskIdPatch**](#apitaskstaskidpatch) | **PATCH** /api/tasks/{taskId} | |

# **apiTasksPost**
> ResponseTaskDto apiTasksPost(requestTaskDto)


### Example

```typescript
import {
    TaskApi,
    Configuration,
    RequestTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let requestTaskDto: RequestTaskDto; //

const { status, data } = await apiInstance.apiTasksPost(
    requestTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestTaskDto** | **RequestTaskDto**|  | |


### Return type

**ResponseTaskDto**

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

# **apiTasksTaskIdDelete**
> apiTasksTaskIdDelete()


### Example

```typescript
import {
    TaskApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let taskId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiTasksTaskIdDelete(
    taskId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiTasksTaskIdExecutePost**
> ResponseTaskDto apiTasksTaskIdExecutePost(executeTaskDto)


### Example

```typescript
import {
    TaskApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    ExecuteTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let taskId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let executeTaskDto: ExecuteTaskDto; //

const { status, data } = await apiInstance.apiTasksTaskIdExecutePost(
    taskId,
    executeTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **executeTaskDto** | **ExecuteTaskDto**|  | |
| **taskId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseTaskDto**

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

# **apiTasksTaskIdGet**
> ResponseTaskDto apiTasksTaskIdGet()


### Example

```typescript
import {
    TaskApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let taskId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiTasksTaskIdGet(
    taskId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseTaskDto**

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

# **apiTasksTaskIdPatch**
> ResponseTaskDto apiTasksTaskIdPatch(requestTaskDto)


### Example

```typescript
import {
    TaskApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let taskId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestTaskDto: RequestTaskDto; //

const { status, data } = await apiInstance.apiTasksTaskIdPatch(
    taskId,
    requestTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestTaskDto** | **RequestTaskDto**|  | |
| **taskId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseTaskDto**

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

