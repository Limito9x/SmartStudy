# LogApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiLogsPost**](#apilogspost) | **POST** /api/logs | |
|[**apiLogsTaskLogIdDelete**](#apilogstasklogiddelete) | **DELETE** /api/logs/{taskLogId} | |
|[**apiLogsTaskLogIdGet**](#apilogstasklogidget) | **GET** /api/logs/{taskLogId} | |
|[**apiLogsTaskLogIdPut**](#apilogstasklogidput) | **PUT** /api/logs/{taskLogId} | |

# **apiLogsPost**
> ResponseLogDto apiLogsPost(requestLogDto)


### Example

```typescript
import {
    LogApi,
    Configuration,
    RequestLogDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LogApi(configuration);

let requestLogDto: RequestLogDto; //

const { status, data } = await apiInstance.apiLogsPost(
    requestLogDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestLogDto** | **RequestLogDto**|  | |


### Return type

**ResponseLogDto**

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

# **apiLogsTaskLogIdDelete**
> apiLogsTaskLogIdDelete()


### Example

```typescript
import {
    LogApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new LogApi(configuration);

let taskLogId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiLogsTaskLogIdDelete(
    taskLogId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskLogId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiLogsTaskLogIdGet**
> ResponseLogDto apiLogsTaskLogIdGet()


### Example

```typescript
import {
    LogApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new LogApi(configuration);

let taskLogId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiLogsTaskLogIdGet(
    taskLogId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskLogId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseLogDto**

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

# **apiLogsTaskLogIdPut**
> ResponseLogDto apiLogsTaskLogIdPut(requestLogDto)


### Example

```typescript
import {
    LogApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestLogDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LogApi(configuration);

let taskLogId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestLogDto: RequestLogDto; //

const { status, data } = await apiInstance.apiLogsTaskLogIdPut(
    taskLogId,
    requestLogDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestLogDto** | **RequestLogDto**|  | |
| **taskLogId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseLogDto**

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

