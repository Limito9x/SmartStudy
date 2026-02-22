# AssetApi

All URIs are relative to *http://localhost:5037*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiAssetsAssetIdDelete**](#apiassetsassetiddelete) | **DELETE** /api/assets/{assetId} | |
|[**apiAssetsGet**](#apiassetsget) | **GET** /api/assets | |
|[**apiAssetsPost**](#apiassetspost) | **POST** /api/assets | |

# **apiAssetsAssetIdDelete**
> apiAssetsAssetIdDelete()


### Example

```typescript
import {
    AssetApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AssetApi(configuration);

let assetId: string; // (default to undefined)

const { status, data } = await apiInstance.apiAssetsAssetIdDelete(
    assetId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assetId** | [**string**] |  | defaults to undefined|


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

# **apiAssetsGet**
> Array<AssetResponseDto> apiAssetsGet()


### Example

```typescript
import {
    AssetApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AssetApi(configuration);

let linkedId: ApiAssetsGetLinkedIdParameter; // (optional) (default to undefined)
let linkedType: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAssetsGet(
    linkedId,
    linkedType
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **linkedId** | [**ApiAssetsGetLinkedIdParameter**] |  | (optional) defaults to undefined|
| **linkedType** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<AssetResponseDto>**

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

# **apiAssetsPost**
> Array<AssetResponseDto> apiAssetsPost()


### Example

```typescript
import {
    AssetApi,
    Configuration,
    ApiAssetsGetLinkedIdParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AssetApi(configuration);

let files: Array<File>; // (optional) (default to undefined)
let linkedId: ApiAssetsGetLinkedIdParameter; // (optional) (default to undefined)
let linkedType: number; // (optional) (default to undefined)
let category: number; // (optional) (default to undefined)
let formFieldKey: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAssetsPost(
    files,
    linkedId,
    linkedType,
    category,
    formFieldKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **files** | **Array&lt;File&gt;** |  | (optional) defaults to undefined|
| **linkedId** | **ApiAssetsGetLinkedIdParameter** |  | (optional) defaults to undefined|
| **linkedType** | [**number**] |  | (optional) defaults to undefined|
| **category** | [**number**] |  | (optional) defaults to undefined|
| **formFieldKey** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<AssetResponseDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/x-www-form-urlencoded
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

