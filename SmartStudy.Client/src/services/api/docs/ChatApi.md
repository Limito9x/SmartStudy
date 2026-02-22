# ChatApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiChatSessionsGet**](#apichatsessionsget) | **GET** /api/Chat/sessions | |
|[**apiChatSessionsPost**](#apichatsessionspost) | **POST** /api/Chat/sessions | |
|[**apiChatSessionsSessionIdGet**](#apichatsessionssessionidget) | **GET** /api/Chat/sessions/{sessionId} | |
|[**apiChatSessionsSessionIdStreamPost**](#apichatsessionssessionidstreampost) | **POST** /api/Chat/sessions/{sessionId}/stream | |

# **apiChatSessionsGet**
> apiChatSessionsGet()


### Example

```typescript
import {
    ChatApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

const { status, data } = await apiInstance.apiChatSessionsGet();
```

### Parameters
This endpoint does not have any parameters.


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

# **apiChatSessionsPost**
> apiChatSessionsPost(sessionDto)


### Example

```typescript
import {
    ChatApi,
    Configuration,
    SessionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let sessionDto: SessionDto; //

const { status, data } = await apiInstance.apiChatSessionsPost(
    sessionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sessionDto** | **SessionDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiChatSessionsSessionIdGet**
> apiChatSessionsSessionIdGet()


### Example

```typescript
import {
    ChatApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let sessionId: ApiAssetsGetLinkedIdParameter; // (default to undefined)

const { status, data } = await apiInstance.apiChatSessionsSessionIdGet(
    sessionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sessionId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


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

# **apiChatSessionsSessionIdStreamPost**
> apiChatSessionsSessionIdStreamPost(chatDto)


### Example

```typescript
import {
    ChatApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter,
    ChatDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ChatApi(configuration);

let sessionId: ApiAssetsGetLinkedIdParameter; // (default to undefined)
let chatDto: ChatDto; //

const { status, data } = await apiInstance.apiChatSessionsSessionIdStreamPost(
    sessionId,
    chatDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **chatDto** | **ChatDto**|  | |
| **sessionId** | [**ApiAssetsGetLinkedIdParameter**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

