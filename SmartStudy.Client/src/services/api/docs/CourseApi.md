# CourseApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiCoursesCourseIdDelete**](#apicoursescourseiddelete) | **DELETE** /api/courses/{CourseId} | |
|[**apiCoursesCourseIdGet**](#apicoursescourseidget) | **GET** /api/courses/{CourseId} | |
|[**apiCoursesCourseIdPatch**](#apicoursescourseidpatch) | **PATCH** /api/courses/{CourseId} | |
|[**apiCoursesPost**](#apicoursespost) | **POST** /api/courses | |

# **apiCoursesCourseIdDelete**
> apiCoursesCourseIdDelete()


### Example

```typescript
import {
    CourseApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiCoursesCourseIdDelete(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiCoursesCourseIdGet**
> ResponseCourseDto apiCoursesCourseIdGet()


### Example

```typescript
import {
    CourseApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiCoursesCourseIdGet(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseCourseDto**

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

# **apiCoursesCourseIdPatch**
> ResponseCourseDto apiCoursesCourseIdPatch(requestCourseDto)


### Example

```typescript
import {
    CourseApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    RequestCourseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let requestCourseDto: RequestCourseDto; //

const { status, data } = await apiInstance.apiCoursesCourseIdPatch(
    courseId,
    requestCourseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestCourseDto** | **RequestCourseDto**|  | |
| **courseId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

**ResponseCourseDto**

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

# **apiCoursesPost**
> ResponseCourseDto apiCoursesPost(requestCourseDto)


### Example

```typescript
import {
    CourseApi,
    Configuration,
    RequestCourseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let requestCourseDto: RequestCourseDto; //

const { status, data } = await apiInstance.apiCoursesPost(
    requestCourseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestCourseDto** | **RequestCourseDto**|  | |


### Return type

**ResponseCourseDto**

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

