# AuthApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiAuthLoginPost**](#apiauthloginpost) | **POST** /api/Auth/login | |
|[**apiAuthMeGet**](#apiauthmeget) | **GET** /api/Auth/me | |
|[**apiAuthRegisterPost**](#apiauthregisterpost) | **POST** /api/Auth/register | |

# **apiAuthLoginPost**
> LoginResponseDto apiAuthLoginPost(userLoginDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    UserLoginDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let userLoginDto: UserLoginDto; //

const { status, data } = await apiInstance.apiAuthLoginPost(
    userLoginDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userLoginDto** | **UserLoginDto**|  | |


### Return type

**LoginResponseDto**

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

# **apiAuthMeGet**
> UserResponseDto apiAuthMeGet()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.apiAuthMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserResponseDto**

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

# **apiAuthRegisterPost**
> UserResponseDto apiAuthRegisterPost(userRegisterDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    UserRegisterDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let userRegisterDto: UserRegisterDto; //

const { status, data } = await apiInstance.apiAuthRegisterPost(
    userRegisterDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userRegisterDto** | **UserRegisterDto**|  | |


### Return type

**UserResponseDto**

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

