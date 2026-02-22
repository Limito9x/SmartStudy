# LearningPathApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiLearningPathsGet**](#apilearningpathsget) | **GET** /api/learning-paths | |
|[**apiLearningPathsLearningPathIdDelete**](#apilearningpathslearningpathiddelete) | **DELETE** /api/learning-paths/{LearningPathId} | |
|[**apiLearningPathsLearningPathIdGet**](#apilearningpathslearningpathidget) | **GET** /api/learning-paths/{LearningPathId} | |
|[**apiLearningPathsLearningPathIdPatch**](#apilearningpathslearningpathidpatch) | **PATCH** /api/learning-paths/{LearningPathId} | |
|[**apiLearningPathsPost**](#apilearningpathspost) | **POST** /api/learning-paths | |

# **apiLearningPathsGet**
> Array<ResponseLearningPathDto> apiLearningPathsGet()


### Example

```typescript
import {
    LearningPathApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LearningPathApi(configuration);

const { status, data } = await apiInstance.apiLearningPathsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ResponseLearningPathDto>**

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

# **apiLearningPathsLearningPathIdDelete**
> apiLearningPathsLearningPathIdDelete()


### Example

```typescript
import {
    LearningPathApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new LearningPathApi(configuration);

let learningPathId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiLearningPathsLearningPathIdDelete(
    learningPathId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **learningPathId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiLearningPathsLearningPathIdGet**
> ResponseLearningPathDto apiLearningPathsLearningPathIdGet()


### Example

```typescript
import {
    LearningPathApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new LearningPathApi(configuration);

let learningPathId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiLearningPathsLearningPathIdGet(
    learningPathId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **learningPathId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseLearningPathDto**

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

# **apiLearningPathsLearningPathIdPatch**
> ResponseLearningPathDto apiLearningPathsLearningPathIdPatch(requestLearningPathDto)


### Example

```typescript
import {
    LearningPathApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestLearningPathDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LearningPathApi(configuration);

let learningPathId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestLearningPathDto: RequestLearningPathDto; //

const { status, data } = await apiInstance.apiLearningPathsLearningPathIdPatch(
    learningPathId,
    requestLearningPathDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestLearningPathDto** | **RequestLearningPathDto**|  | |
| **learningPathId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseLearningPathDto**

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

# **apiLearningPathsPost**
> ResponseLearningPathDto apiLearningPathsPost(requestLearningPathDto)


### Example

```typescript
import {
    LearningPathApi,
    Configuration,
    RequestLearningPathDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LearningPathApi(configuration);

let requestLearningPathDto: RequestLearningPathDto; //

const { status, data } = await apiInstance.apiLearningPathsPost(
    requestLearningPathDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestLearningPathDto** | **RequestLearningPathDto**|  | |


### Return type

**ResponseLearningPathDto**

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

