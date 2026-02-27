# UserApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiUsersSettingPost**](#apiuserssettingpost) | **POST** /api/users/setting | |

# **apiUsersSettingPost**
> apiUsersSettingPost(userSettingDto)


### Example

```typescript
import {
    UserApi,
    Configuration,
    UserSettingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userSettingDto: UserSettingDto; //

const { status, data } = await apiInstance.apiUsersSettingPost(
    userSettingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userSettingDto** | **UserSettingDto**|  | |


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

