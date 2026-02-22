# SemesterApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiSemestersGet**](#apisemestersget) | **GET** /api/Semesters | |
|[**apiSemestersPost**](#apisemesterspost) | **POST** /api/Semesters | |
|[**apiSemestersSemesterIdDelete**](#apisemesterssemesteriddelete) | **DELETE** /api/Semesters/{SemesterId} | |
|[**apiSemestersSemesterIdGet**](#apisemesterssemesteridget) | **GET** /api/Semesters/{SemesterId} | |
|[**apiSemestersSemesterIdPut**](#apisemesterssemesteridput) | **PUT** /api/Semesters/{SemesterId} | |

# **apiSemestersGet**
> Array<ResponseSemesterDto> apiSemestersGet()


### Example

```typescript
import {
    SemesterApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SemesterApi(configuration);

const { status, data } = await apiInstance.apiSemestersGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ResponseSemesterDto>**

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

# **apiSemestersPost**
> ResponseSemesterDto apiSemestersPost(requestSemesterDto)


### Example

```typescript
import {
    SemesterApi,
    Configuration,
    RequestSemesterDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SemesterApi(configuration);

let requestSemesterDto: RequestSemesterDto; //

const { status, data } = await apiInstance.apiSemestersPost(
    requestSemesterDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestSemesterDto** | **RequestSemesterDto**|  | |


### Return type

**ResponseSemesterDto**

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

# **apiSemestersSemesterIdDelete**
> apiSemestersSemesterIdDelete()


### Example

```typescript
import {
    SemesterApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new SemesterApi(configuration);

let semesterId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiSemestersSemesterIdDelete(
    semesterId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **semesterId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiSemestersSemesterIdGet**
> ResponseSemesterDto apiSemestersSemesterIdGet()


### Example

```typescript
import {
    SemesterApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new SemesterApi(configuration);

let semesterId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiSemestersSemesterIdGet(
    semesterId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **semesterId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseSemesterDto**

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

# **apiSemestersSemesterIdPut**
> ResponseSemesterDto apiSemestersSemesterIdPut(requestSemesterDto)


### Example

```typescript
import {
    SemesterApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestSemesterDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SemesterApi(configuration);

let semesterId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestSemesterDto: RequestSemesterDto; //

const { status, data } = await apiInstance.apiSemestersSemesterIdPut(
    semesterId,
    requestSemesterDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestSemesterDto** | **RequestSemesterDto**|  | |
| **semesterId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseSemesterDto**

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

