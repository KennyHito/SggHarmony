# Axios

## Introduction

Axios is a promise-based network request library that runs in Node.js and browsers. By adapting [Axios](https://github.com/axios/axios) v1.3.4, this library works with OpenHarmony while retaining the following features inherent in Axios:

- HTTP requests
- Promise API
- Request and response interceptors
- Transformation of request and response data
- Automatic conversion of JSON data

![](./screenshots/axios_en.gif)

## How to Install

```javascript
ohpm install @ohos/axios
```

For details about the OpenHarmony ohpm environment configuration, see [Installing the OpenHarmony HAR](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md).

## Required Permissions
```
ohos.permission.INTERNET
```

## Available APIs and Attributes

### APIs

| API                           | Parameter                                    | Description        |
|-----------------------------------|----------------------------------------|------------|
| axios(config)                     | [config](#requesting-configuration): configuration                  | Sends a request.      |
| axios.create(config)              | [config](#requesting-configuration): configuration                  | Creates an instance.      |
| axios.request(config)             | [config](#requesting-configuration): configuration                  | Sends a request.      |
| axios.get(url[, config])          | **url**: URL<br>[config](#requesting-configuration): configuration     | Sends a GET request.   |
| axios.delete(url[, config])       | **url**: URL<br>[config](#requesting-configuration): configuration     | Sends a DELETE request.|
| axios.post(url[, data[, config]]) | **url**: URL<br>**data**: request body data<br>[config](#requesting-configuration): configuration| Sends a POST request.  |
| axios.put(url[, data[, config]])  | **url**: URL<br>**data**: request body data<br>[config](#requesting-configuration): configuration     | Sends a PUT request.   |

### Attributes

| Attribute                          | Description                                                                       |
|----------------------------------|---------------------------------------------------------------------------|
| axios.defaults['xxx']            | Default settings. The value is the configuration item specified in [config](#requesting-configuration).<br>For example, **axios.defaults.headers** obtains header information.|
| axios.interceptors              | Interceptors. For details, see [Interceptors](#interceptors).                                                 |

## Example

Before using the demo, change the server address in the **entry** > **src** > **main** > **ets** > **common** > **Common.ets** file to the actual address.

Initiate a GET request.

Axios supports generic parameters. Because ArkTS does not support the **any** type, you must specify the parameter type.

Examples: **axios.get<T = any**, **R = AxiosResponse<T>**, **D = any>(url)**.

- **T**: response data type. When you send a POST request, you may receive a JSON object. **T** indicates the type of the JSON object. By default, **T** is **any**, which means you can receive any type of data.
- **R**: response body type. When the server returns a response, the response body is usually a JSON object. **R** indicates the type of the JSON object. By default, **R** is **AxiosResponse<T>**, which means that the response body is an **AxiosResponse** object whose **data** attribute is of the T type.
- **D**: request parameter type. When you send a GET request, you may want to add some query parameters to the URL. **D** indicates the type of these query parameters. If the parameter is empty, **D** is of the null type.
```javascript
import axios from '@ohos/axios'
interface userInfo{
  id: number
  name: string,
  phone: number
}

// Initiate a request to the user with the specified ID.
axios.get<userInfo, AxiosResponse<userInfo>, null>('/user?ID=12345')
.then((response: AxiosResponse<userInfo>)=> {
  // Processing successful
  console.info("id" + response.data.id)
  console.info(JSON.stringify(response));
})
.catch((error: AxiosError)=> {
  // Processing error
  console.info(JSON.stringify(error));
})
.then(()=> {
  // Always executed
});

// The preceding request can also be completed as follows (optional):
axios.get<userInfo, AxiosResponse<userInfo>, null>('/user', {
  params: {
    ID: 12345
  }
})
.then((response:AxiosResponse<userInfo>) => {
  console.info("id" + response.data.id)
  console.info(JSON.stringify(response));
})
.catch((error:AxiosError) => {
  console.info(JSON.stringify(error));
})
.then(() => {
  // Always executed
});

// The async/await usage is supported.
async function getUser() {
  try {
        const response:AxiosResponse = await axios.get<string, AxiosResponse<string>, null>(this.getUrl);
        console.log(JSON.stringify(response));
      } catch (error) {
    console.error(JSON.stringify(error));
  }
}
```

Send a POST request.
```javascript
interface user {
  firstName: string,
  lastName: string
}
   axios.post<string, AxiosResponse<string>, user>('/user', {
     firstName: 'Fred',
     lastName: 'Flintstone'
   })
   .then((response: AxiosResponse<string>) => {
     console.info(JSON.stringify(response));
   })
   .catch((error) => {
  console.info(JSON.stringify(error));
});
```

Initiate multiple concurrent requests.

```javascript
 const getUserAccount = ():Promise<AxiosResponse> => {
      return axios.get<string, AxiosResponse<string>, null>('/user/12345');
    }

 const getUserPermissions = ():Promise<AxiosResponse> => {
      return axios.get<string, AxiosResponse<string>, null>('/user/12345/permissions');
    }

 Promise.all<AxiosResponse>([getUserAccount(), getUserPermissions()])
 .then((results:AxiosResponse[]) => {
        const acct = results[0].data as string;
        const perm = results[1].data as string;
      });
```

## How to Use

### axios API

#### Create a request by passing related configurations to Axios.

##### axios(config)
```javascript
// Send a GET request.
axios<string, AxiosResponse<string>, null>({
  method: "get",
  url: 'https://www.xxx.com/info'
}).then((res: AxiosResponse) => {
  console.info('result:' + JSON.stringify(res.data));
}).catch((error: AxiosError) => {
  console.error(error.message);
})
```

##### axios(url[, config])
```javascript
// Send a GET request (default method).
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', { params: { key: "value" } })
.then((response: AxiosResponse) => {
  console.info("result:" + JSON.stringify(response.data));
})
.catch((error: AxiosError) => {
  console.error("result:" + error.message);
});
```

#### Create a request using the alias of the request method.
For convenience, aliases are provided for all supported request methods.

- axios.request(config)
- axios.get(url[, config])
- axios.delete(url[, config])
- axios.post(url[, data[, config]])
- axios.put(url[, data[, config]])

> **NOTE**
>
> When the alias method is used, the **url**, **method**, and **data** attributes do not need to be specified in **config**.

```javascript
// Send a GET request.
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', { params: { key: "value" } })
.then((response: AxiosResponse) => {
  console.info("result:" + JSON.stringify(response.data));
})
.catch((error: AxiosError) => {
  console.error("result:" + error.message);
});
```

### Axios Instance

#### Creating an Instance
You can create an instance with custom configuration.<br>
axios.create([config])
```javascript
const instance = axios.create({
  baseURL: 'https://www.xxx.com/info',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});
```

#### Instance Methods
- axios#request(config)
- axios#get(url[, config])
- axios#delete(url[, config])
- axios#post(url[, data[, config]])
- axios#put(url[, data[, config]])

### Requesting Configuration
The following are the available **config** options for making requests. Only **url** is required. Requests will default to **GET** if **method **is not specified.

  ```javascript
{
    // url indicates the server URL used for the request.
    url: '/user',
    
    // method indicates the method used for creating the request. The value is case-insensitive, and the options are post, get (default), put, and delete.
    method: 'get', // default
    
    // baseURL is automatically prepended to url unless url is an absolute URL.
    // It can be convenient to set baseURL for an instance of axios to pass relative URLs to methods of that instance.
    baseURL: 'https://www.xxx.com/info',
    
    // transformRequest allows request data to be changed before it is sent to the server.
    // This option is only available for PUT, POST, and PATCH request methods.
    // The last function in the array must return a string or an instance of Buffer, ArrayBuffer, FormData, or Stream.
    // You may modify the headers object.
    transformRequest: [function (data, headers) {
      // You can transform the request data.
      return data;
    }],

    // transformResponse allows response data to be changed before it is passed to then/catch.
    transformResponse: [function (data) {
      // You can transform the received data.
      return data;
    }],
    
    // headers indicates an array of headers to be sent.
    headers: {'Content-Type': 'application/json'},
    
    // params indicates an array of URL parameters to be sent with the request.
    // It must be a plain object. Otherwise, the object, such as URLSearchParams, must be serialized using paramsSerializer.
    params: {
      ID: 12345
    },
    
    // paramsSerializer is a function for params serialization.
    paramsSerializer: function(params) {
      return params
    },
    
    // data indicates the data to be sent as the request body.
    // This option is only available for PUT, POST, and PATCH request methods.
    // If transformRequest is not set, the value must be one of the following types. Other types are converted using transformRequest.
    // - string, plain object, ArrayBuffer
    data: {
      firstName: 'Fred'
    },
    
    // Optional syntax for sending request body data
    // Request mode: POST
    // Only the value is sent, not the key.
    data: 'Country=Brasil&City=Belo Horizonte',
    
    // timeout indicates the number of milliseconds before the request times out. The value 0 indicates that there is no timeout.
    // If the request takes longer than the timeout time, it will be aborted.
    timeout: 1000,
    
    // adapter allows for custom handling of requests, which makes testing easier.
    // Return a promise and supply a valid response (see lib/adapters/README.md).
    adapter: function (config) {
      /* ... */
    },
    // If this parameter is set, the system uses the CA certificate in the specified path (ensure that the CA certificate is accessible). Otherwise, the system uses the preset CA certificate in the /etc/ssl/certs/cacert.pem directory. The certificate path is a sandbox path, which can bed obtained through Global.getContext().filesDir.
    caPath: '',

    // clientCert indicates the client certificate. 
    // It includes the following four attributes: cert, certType, key, and keyPasswd.
    clientCert:{
        certPath: '',  // Client certificate path.
        certType: '',  // Client certificate type, including pem, der, and p12.
        keyPath: '',   // Path to the certificate key.
        keyPasswd: ''  // Passphrase of the certificate.
    }

    // Priority. The value range is [1,1000]. The default value is 1. A larger value indicates a higher priority.
    priority: 1,

    // responseType indicates the type of the returned data. This parameter is not used by default. If it is set, the system returns the specified type of data preferentially.
    // The options are 'string', 'object', and 'array_buffer'.
    responseType: 'string', 

    //  `proxy`
    // Whether to use HTTP proxy. The default value is false, which means not to use HTTP proxy.
    // When the proxy is of the AxiosProxyConfig type, the specified proxy is used.
    proxy: {
        host: 'xx', // Host port
        port: xx, // Host port
        exclusionList: [] // Do not use a blocking list for proxy servers
    }
    
    // onUploadProgress allows handling of progress events for uploads.
    onUploadProgress: function (progressEvent) {
      // Handle the native progress event.
    },
    
    // onDownloadProgress allows handling of progress events for downloads. It must be set for file downloads.
    onDownloadProgress: function (progressEvent) {
      // Handle the native progress event.
    },
    
    // Application context-based, applicable only to upload/download requests
    context: context,
    
    // Download path. This parameter applies only to download requests.
    // In the stage model, use the AbilityContext class to obtain the file path, for example, ${getContext(this).cacheDir}/test.txt, and store the file in this path.
    filePath: context,
    }


  ```

### Response Structure
The response to a request contains the following information:

```javascript
{
  // data indicates the response provided by the server.
  data: {},

  // status indicates the HTTP status code from the server response.
  status: 200,

  // statusText indicates the HTTP status message from the server response.
  statusText: 'OK',

  // headers indicates an array of HTTP headers whith which the server responds.
  // All header names are in lowercase and can be accessed using the bracket notation.
  // Example: response.headers['content-type']
  headers: {},

  // config indicates the configuration information requested by Axios.
  config: {},
  
  // request indicates the request that generates the response.
  request: {}
}
```

When **then** is used, you will receive the following response:

```javascript
axios.get<string, AxiosResponse<string>, null>(this.getUrl)
 .then( (response:AxiosResponse<string>)=> {
   console.log("result data: " + response.data);
   console.log("result status: " + response.status);
   console.log("result statusText: " + response.statusText);
   console.log("result headers: " + response.headers);
   console.log("result config: " + response.config);
 });

```

### Configuration Defaults
You can specify **config** defaults, which will be applied to every request.

#### Global Axios Defaults
```javascript
axios.defaults.baseURL = 'https://www.xxx.com';
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
```

#### Custom Instance Defaults
```javascript
// Set config defaults when creating an instance.
const instance = axios.create({
  baseURL: 'https://www.xxx.com'
});

// Change the defaults after the instance is created.
instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;
```
Configuration Priority
Configurations are merged based on priorities. The priority order is as follows: library defaults found in **lib/defaults.js**, **defaults** property of the instance, and **config** parameter of the request. The latter takes precedence over the former. Here's an example.

```javascript
// Create an instance using the library defaults.
// At this point the default timeout value is 0.
const instance = axios.create();

// Override the timeout default for the library.
// Now, all requests using this instance will wait 2.5 seconds before timing out.
instance.defaults.timeout = 2500;

// Override timeout for this request because it's known to take a long time.
instance.get<string, AxiosResponse<string>, null>(this.getUrl, {
  timeout: 5000
})
```

### Interceptors
You can intercept requests or responses before they are handled by **then** or **catch**.

```javascript
// Add a request interceptor.
axios.interceptors.request.use((config:InternalAxiosRequestConfig) => {
  // Do something about the request data.
  return config;
}, (error:AxiosError) => {
  // Do something with the request error.
  return Promise.reject(error);
});


// Add a response interceptor.
axios.interceptors.response.use((response:AxiosResponse)=> {
  // Do something about the response data.
  return response;
}, (error:AxiosError)=> {
  // Do something with the response error.
  return Promise.reject(error);
});

```

Remove an interceptor.
```javascript
const myInterceptor = axios.interceptors.request.use((response: AxiosResponse)=> {/*...*/});
axios.interceptors.request.eject(myInterceptor);
```
You can add interceptors to a custom instance of Axios.
```javascript
const instance = axios.create();
instance.interceptors.request.use((config:InternalAxiosRequestConfig)=> {/*...*/});
```

### Specifying the Type of the Returned Data
**responseType** indicates the type of the returned data. This parameter is not used by default. If this parameter is set, the system returns the specified type of data preferentially.

The options are 'string', 'object', and 'array_buffer'.

After **responseType** is set, the data in **response.data** is of the specified type.

```javascript
 axios<string, AxiosResponse<string>, null>({
    url: 'https://www.xxx.com/info',
    method: 'get',
    responseType: 'array_buffer', 
  }).then((res: AxiosResponse) => {
   // Logic to follow when the request is handled successfully.
  })
```

> Note: You can also override the transformResponse method to modify the returned data.
```javascript
 axios<string, AxiosResponse<string>, null>({
    url: 'https://www.xxx.com/info',
    method: 'get',
    responseType: 'array_buffer', 
    transformResponse:(data)=>{
      return data
    }
  }).then((res: AxiosResponse) => {
   // Logic to follow when the request is handled successfully.
  })
```

### Specifying the CA Certificate

```javascript
  axios<infoModel, AxiosResponse<infoModel>, null>({
    url: 'https://www.xxx.com/xx',
    method: 'get',
    caPath: '', // Path of the CA certificate
  }).then((res: AxiosResponse) => {
    // 
  }).catch((err: AxiosError) => {
    //
  })
```

### Specifying the Client Certificate

```javascript
  axios<infoModel, AxiosResponse<infoModel>, null>({
    url: 'https://www.xxx.com/xx',
    method: 'get',
    caPath: '', // Path of the CA certificate
    clientCert: {
        certPath: '', // Client certificate path
        certType: 'p12', // Client certificate type, which can be pem, der, or p12
        keyPath: '', // Path of the client certificate key
        keyPasswd:'' // Passphrase of the certificate
      }
  }).then((res: AxiosResponse) => {
    // 
  }).catch((err: AxiosError) => {
    //
  })
```

### Setting the Proxy
```javascript
    axios<string, AxiosResponse<string>, null>({
      url: 'xxx',
      method: 'get',
      proxy:{
        host: 'xxx',
        port: xx,
        exclusionList: []
      }
    }).then((res: AxiosResponse) => {
      // 
    }).catch((err: AxiosError) => {
      //
    })
```
### Locking the Certificate

To lock the certificate:

Set the certificate information in **entry/src/main/resources/base/profile/network_config.json**.


```javascript
{
  "network-security-config": {
    "domain-config": [
      {
        "domains": [
          {
            "include-subdomains": true,
            "name": "x.x.x.x"  // IP address or domain name
          }
        ],
        "pin-set": {
          "expiration": "2024-8-6", // Validity period of the certificate lock
          "pin": [
            {
              "digest-algorithm": "sha256", // Hash algorithm of the message digest. The value can only be sha256.
              "digest": "WAFcHG6pAINrztx343ccddfzLOdfoDS9pPgMv2XHk=" // Message digest
            }
          ]
        }
      }
    ]
  }
}
```

#### Obtaining the Message Digest Through the digest Field

Use OpenSSL to obtain the certificate from the server and extract the message digest.
```javascript
openssl s_client -connect host:port 2>&1 < /dev/null \
                    | sed -n '/-----BEGIN/,/-----END/p' \
                    | openssl x509 -noout -pubkey \
                    | openssl pkey -pubin -outform der \
                    | openssl dgst -sha256 -binary \
                    | openssl enc -base64
```



### Uploading and Downloading Files
#### Uploading Files
- To upload files, the **FormData** module must be imported separately.
- The current version supports only the stage model.
- Files can be uploaded in URI or ArrayBuffer format. In URI format, the URI must start with "internal://cache/", for example, **internal://cache/path/to/file.txt**.
- The request form data value is of the string type.

##### To upload content in ArrayBuffer format, follow the usage below:

```javascript
import axios from '@ohos/axios'
import { FormData } from '@ohos/axios'
import fs from '@ohos.file.fs';

// ArrayBuffer
let formData = new FormData()
let cacheDir = getContext(this).cacheDir
try {
  // Write the code
  let path = cacheDir + '/hello.txt';
  let file = fs.openSync(path, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE)
  fs.writeSync(file.fd, "hello, world"); // Write data to a file in synchronous mode.
  fs.fsyncSync(file.fd); // Synchronize file data in synchronous mode.
  fs.closeSync(file.fd);

  // Read data.
  let file2 = fs.openSync(path, 0o2);
  let stat = fs.lstatSync(path);
  let buf2 = new ArrayBuffer(stat.size);
  fs.readSync(file2.fd, buf2); // Read data from the stream file in synchronous mode.
  fs.fsyncSync(file2.fd);
  fs.closeSync(file2.fd);

  formData.append('file', buf2);
} catch (err) {
  console.info('err:' + JSON.stringify(err));
}
// Send a request.
axios.post<string, AxiosResponse<string>, FormData>(this.uploadUrl, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  context: getContext(this),
  onUploadProgress: (progressEvent: AxiosProgressEvent): void => {
  console.info(progressEvent && progressEvent.loaded && progressEvent.total ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) + '%' : '0%');
},
}).then((res: AxiosResponse) => {
  console.info("result" + JSON.stringify(res.data));
}).catch((error: AxiosError) => {
  console.error("error:" + JSON.stringify(error));
})
```

##### To upload content in URI format, follow the usage below:

```javascript
import axios from '@ohos/axios'
import { FormData } from '@ohos/axios'

let formData = new FormData()
formData.append('file', 'internal://cache/blue.jpg')

// Send a request.
axios.post<string, AxiosResponse<string>, FormData>('https://www.xxx.com/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  context: getContext(this),
  onUploadProgress: (progressEvent: AxiosProgressEvent): void => {
    console.info(progressEvent && progressEvent.loaded && progressEvent.total ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) + '%' : '0%');
  },
}).then((res: AxiosResponse<string>) => {
  console.info("result" + JSON.stringify(res.data));
}).catch((err: AxiosError) => {
  console.error("error:" + JSON.stringify(err));
})
```


#### Downloading Files
Set **filePath** to the download path (defaulted to **'internal://cache/'**).
> **NOTE**
>
> **filePath:'workspace/test.txt'**: creates a **workspace** folder in the default path and saves the file to the folder.
>
> **filePath:'test.txt'**: saves the file to the default path.
>
> **filePath:'workspace/'**: creates a **workspace** folder in the default path and saves downloaded files to the folder.

- The current version supports only the stage model.<br>
  If a file to be downloaded already exists in the path specified by **filePath**, the download fails. In this case, delete the existing file first.

```javascript
let filePath = getContext(this).cacheDir + '/blue.jpg'
// Download the file. If the file already exists, delete the existing one first.
try {
  fs.accessSync(filePath);
  fs.unlinkSync(filePath);
} catch(err) {}

axios({
  url: 'https://www.xxx.com/blue.jpg',
  method: 'get',
  context: getContext(this),
  filePath: filePath ,
  onDownloadProgress: (progressEvent: AxiosProgressEvent): void => {
    console.info("progress: " + progressEvent && progressEvent.loaded && progressEvent.total ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) : 0)
  }
}).then((res)=>{
  console.info("result: " + JSON.stringify(res.data));
}).catch((error)=>{
  console.error("error:" + JSON.stringify(error));
})
```

### Handling Errors

####  Example
```javascript
axios.get<string, AxiosResponse<string>, null>('/user/12345')
  .catch((error:AxiosError)=> {
    console.log(JSON.stringify(error.message));
    console.log(JSON.stringify(error.code));
    console.log(JSON.stringify(error.config));
  });
```

#### Error Codes
- When a network request error occurs, the **catch** method is called. [Check errror codes](https://docs.openharmony.cn/pages/v3.2/en/application-dev/reference/errorcodes/errorcode-net-http.md/).
- Error constants

| Name| Type| Readable| Writable| Description|
| -------- | -------- | -------- | -------- | -------- |
| NETWORK_MOBILE | number | Yes| No| Whether download is allowed on a mobile network.|
| NETWORK_WIFI | number | Yes| No| Whether download is allowed on a WLAN.|
| ERROR_CANNOT_RESUME<sup>7+</sup> | number | Yes| No| Failure to resume the download due to an error.|
| ERROR_DEVICE_NOT_FOUND<sup>7+</sup> | number | Yes| No| Failure to find a storage device such as a memory card.|
| ERROR_FILE_ALREADY_EXISTS<sup>7+</sup> | number | Yes| No| Failure to download the file because it already exists.|
| ERROR_FILE_ERROR<sup>7+</sup> | number | Yes| No| File operation failure.|
| ERROR_HTTP_DATA_ERROR<sup>7+</sup> | number | Yes| No| HTTP transmission failure.|
| ERROR_INSUFFICIENT_SPACE<sup>7+</sup> | number | Yes| No| Insufficient storage space.|
| ERROR_TOO_MANY_REDIRECTS<sup>7+</sup> | number | Yes| No| Error caused by too many network redirections.|
| ERROR_UNHANDLED_HTTP_CODE<sup>7+</sup> | number | Yes| No| Unidentified HTTP code.|
| ERROR_UNKNOWN<sup>7+</sup> | number | Yes| No| Unknown error.|
| PAUSED_QUEUED_FOR_WIFI<sup>7+</sup> | number | Yes| No| Download paused and queuing for a WLAN connection, because the file size exceeds the maximum value allowed for a mobile network session.|
| PAUSED_UNKNOWN<sup>7+</sup> | number | Yes| No| Download paused due to unknown reasons.|
| PAUSED_WAITING_FOR_NETWORK<sup>7+</sup> | number | Yes| No| Download paused due to a network connection problem, for example, network disconnection.|
| PAUSED_WAITING_TO_RETRY<sup>7+</sup> | number | Yes| No| Download paused and then retried.|
| SESSION_FAILED<sup>7+</sup> | number | Yes| No| Download failure without retry.|
| SESSION_PAUSED<sup>7+</sup> | number | Yes| No| Download paused.|
| SESSION_PENDING<sup>7+</sup> | number | Yes| No| Download pending.|
| SESSION_RUNNING<sup>7+</sup> | number | Yes| No| Download in progress.|
| SESSION_SUCCESSFUL<sup>7+</sup> | number | Yes| No| Successful download.|

## Constraints

Axios has been verified in the following versions:

DevEco Studio: 4.1 Canary2(4.1.3.325), SDK: API11(4.1.0.36)

> **NOTE**
>
> The certificate-based bidirectional authentication and certificate pinning features are available only in API version 11. Other features are available since API version 9.

## Directory Structure
```javascript
|---- axios
|     |---- AppScrope  # Sample code
|     |---- entry  # Sample code
|     |---- screenshots # Screenshots
|     |---- axios  # Axios library folder
|           |---- build  # Files generated after Axios builds
|           |---- src  # 模块代码
|                |---- ets/components   # Module code
|                     |---- lib         # Axios network request core code
|            |---- index.js        # Entry file
|            |---- index.d.ts      # Declaration file
|            |---- *.json5      # Configuration file
|     |---- README.md  # File that describes how to download and use Axios
|     |---- README.OpenSource  # Open source notice
|     |---- CHANGELOG.md  # Changelog
```

## How to Contribute

If you find any problem when using Axios, submit an [issue](https://gitee.com/openharmony-sig/axios/issues) or a [PR](https://gitee.com/openharmony-sig/axios/pulls) to us.

## License

The repository is based on [MIT](https://gitee.com/openharmony-sig/axios/blob/master/LICENSE).
