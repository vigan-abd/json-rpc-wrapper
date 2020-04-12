## Classes

<dl>
<dt><a href="#RpcError">RpcError</a></dt>
<dd><p>Represents the json rpc error base structure, it accepts 3 params: code, message, data as specified by the protocol</p>
</dd>
<dt><a href="#RpcServiceBase">RpcServiceBase</a></dt>
<dd><p>Represents the base class from which rpc callable classes can be extended.
Extended classes can be wrapped through rpc wrapper and exposed via different
transport protocols as json rpc services.</p>
</dd>
<dt><a href="#RpcWrapper">RpcWrapper</a></dt>
<dd><p>Represents the rpc wrapper class that will wrap requests and responses for any object/instance.
This class can be used to rpcify the variables and make them callable through json rpc 2.0 protocol.
Keep in mind that only functions can be invoked, there&#39;s no way to invoke getting/setting properties
of object! This instance will act as a proxy to the wrapped object, and can call any function type in object
(with callbacks, async functions and simple functions)</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#isStringOrNumber">isStringOrNumber(val)</a> ⇒ <code>boolean</code></dt>
<dd><p>Determines if the value is primitive string or primitive number,
in case of number NaN and Infinity values are not considered numbers.
It returns true in case of it represents one of these two types</p>
</dd>
<dt><a href="#isNil">isNil(val)</a> ⇒ <code>boolean</code></dt>
<dd><p>Determines if the value is null or undefined, returns true in case of it represents one of these two types</p>
</dd>
<dt><a href="#getObjectFunctions">getObjectFunctions(toCheck)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Returns the functions/methods that belong to object, it excludes the object prototype methods:</p>
<ul>
<li>__defineGetter__,</li>
<li>__defineSetter__,</li>
<li>__lookupGetter__,</li>
<li>__lookupSetter__,</li>
<li>constructor,</li>
<li>hasOwnProperty,</li>
<li>isPrototypeOf,</li>
<li>propertyIsEnumerable
Methods toLocaleString, toString, valueOf are included</li>
</ul>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#JsonRpcErrorFields">JsonRpcErrorFields</a> : <code>Object</code></dt>
<dd><p>Fields that should be exported during serialization</p>
</dd>
<dt><a href="#JsonRpcRequest">JsonRpcRequest</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#JsonRpcResponse">JsonRpcResponse</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="RpcError"></a>

## RpcError
Represents the json rpc error base structure, it accepts 3 params: code, message, data as specified by the protocol

**Kind**: global class  

* [RpcError](#RpcError)
    * [new RpcError(code, message, [data])](#new_RpcError_new)
    * _instance_
        * [.code](#RpcError+code)
        * [.data](#RpcError+data)
        * [.message](#RpcError+message)
        * [.toString()](#RpcError+toString) ⇒ <code>string</code>
        * [.toJSON()](#RpcError+toJSON) ⇒ [<code>JsonRpcErrorFields</code>](#JsonRpcErrorFields)
    * _static_
        * [.PARSE_ERROR](#RpcError.PARSE_ERROR) : <code>number</code>
        * [.INVALID_REQUEST](#RpcError.INVALID_REQUEST) : <code>number</code>
        * [.METHOD_NOT_FOUND](#RpcError.METHOD_NOT_FOUND) : <code>number</code>
        * [.INVALID_PARAMS](#RpcError.INVALID_PARAMS) : <code>number</code>
        * [.INTERNAL_ERROR](#RpcError.INTERNAL_ERROR) : <code>number</code>
        * [.SERVER_ERROR](#RpcError.SERVER_ERROR) : <code>number</code>
        * [.createError(code, [message], [data])](#RpcError.createError) ⇒ [<code>RpcError</code>](#RpcError)

<a name="new_RpcError_new"></a>

### new RpcError(code, message, [data])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| code | <code>number</code> |  | json rpc error code |
| message | <code>string</code> |  | json rpc error message |
| [data] | <code>any</code> | <code></code> | json rpc additional error data |

**Example**  
```js
RpcError.createError(RpcError.INVALID_REQUEST) // RpcError: { code: -32600, message: 'Invalid request' }
RpcError.createError(RpcError.INVALID_REQUEST, null, new Error('foo')) // RpcError: { code: -32600, message: 'Invalid request', data: 'Error: foo' }
RpcError.createError(RpcError.INVALID_REQUEST, 'INV_REQ', new Error('foo')) // RpcError: { code: -32600, message: 'INV_REQ', data: 'Error: foo' }
```
<a name="RpcError+code"></a>

### rpcError.code
**Kind**: instance property of [<code>RpcError</code>](#RpcError)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| code | <code>number</code> | Represents json rpc error code, e.g. -32700.    If invalid code range is provided -32000 (Server Error) is used,    allowed codes:  [-32603, -32600], -32700, [-32099, -32000] |

<a name="RpcError+data"></a>

### rpcError.data
**Kind**: instance property of [<code>RpcError</code>](#RpcError)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>any</code> | Represents additional error data specified by protocol |

<a name="RpcError+message"></a>

### rpcError.message
**Kind**: instance property of [<code>RpcError</code>](#RpcError)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Represents the json rpc error message, e.g. Parse error |

<a name="RpcError+toString"></a>

### rpcError.toString() ⇒ <code>string</code>
Returns the json representing the error, e.g.: '{"code":-32602,"message":"Invalid params","data":"foo param is required"}'

**Kind**: instance method of [<code>RpcError</code>](#RpcError)  
<a name="RpcError+toJSON"></a>

### rpcError.toJSON() ⇒ [<code>JsonRpcErrorFields</code>](#JsonRpcErrorFields)
Returns the fields that should be exposed on json serialization

**Kind**: instance method of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.PARSE_ERROR"></a>

### RpcError.PARSE\_ERROR : <code>number</code>
-32700

**Kind**: static constant of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.INVALID_REQUEST"></a>

### RpcError.INVALID\_REQUEST : <code>number</code>
-32600

**Kind**: static constant of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.METHOD_NOT_FOUND"></a>

### RpcError.METHOD\_NOT\_FOUND : <code>number</code>
-32601

**Kind**: static constant of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.INVALID_PARAMS"></a>

### RpcError.INVALID\_PARAMS : <code>number</code>
-32602

**Kind**: static constant of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.INTERNAL_ERROR"></a>

### RpcError.INTERNAL\_ERROR : <code>number</code>
-32603

**Kind**: static constant of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.SERVER_ERROR"></a>

### RpcError.SERVER\_ERROR : <code>number</code>
-32000

**Kind**: static constant of [<code>RpcError</code>](#RpcError)  
<a name="RpcError.createError"></a>

### RpcError.createError(code, [message], [data]) ⇒ [<code>RpcError</code>](#RpcError)
**Kind**: static method of [<code>RpcError</code>](#RpcError)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| code | <code>number</code> |  | json rpc error code, if invalid code range is provided -32000 (Server Error) is used,    allowed codes:  [-32603, -32600], -32700, [-32099, -32000] |
| [message] | <code>string</code> | <code>null</code> | json rpc error message, if omitted it will be generated based on error code |
| [data] | <code>any</code> | <code></code> | json rpc additional error data |

<a name="RpcServiceBase"></a>

## *RpcServiceBase*
Represents the base class from which rpc callable classes can be extended.
Extended classes can be wrapped through rpc wrapper and exposed via different
transport protocols as json rpc services.

**Kind**: global abstract class  

* *[RpcServiceBase](#RpcServiceBase)*
    * *[.methods](#RpcServiceBase+methods)*
    * *[.validateMethod(method)](#RpcServiceBase+validateMethod) ⇒ <code>Promise.&lt;void&gt;</code> \| <code>void</code>*
    * *[.validateParams(method, params)](#RpcServiceBase+validateParams) ⇒ <code>Promise.&lt;void&gt;</code> \| <code>void</code>*
    * **[.areParamsValid(method, params)](#RpcServiceBase+areParamsValid) ⇒ <code>Promise.&lt;boolean&gt;</code> \| <code>boolean</code>**

<a name="RpcServiceBase+methods"></a>

### *rpcServiceBase.methods*
**Kind**: instance property of [<code>RpcServiceBase</code>](#RpcServiceBase)  
**Access**: protected  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| methods | <code>Array.&lt;string&gt;</code> | Represents the list of methods that are exposed through rpc calls,    each method here should be implemented with the same name |

<a name="RpcServiceBase+validateMethod"></a>

### *rpcServiceBase.validateMethod(method) ⇒ <code>Promise.&lt;void&gt;</code> \| <code>void</code>*
Checks if the method is available in service and can be called externally,
if not it throws the appropriate rpc error
It should not be overridden in extended classes!

**Kind**: instance method of [<code>RpcServiceBase</code>](#RpcServiceBase)  
**Throws**:

- [<code>RpcError</code>](#RpcError) 


| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The method that will be checked if it exists and it's available |

<a name="RpcServiceBase+validateParams"></a>

### *rpcServiceBase.validateParams(method, params) ⇒ <code>Promise.&lt;void&gt;</code> \| <code>void</code>*
Checks if the params for the called method through rpc are valid,
if not it throws the appropriate rpc error.
It should not be overridden in extended classes!

**Kind**: instance method of [<code>RpcServiceBase</code>](#RpcServiceBase)  
**Throws**:

- [<code>RpcError</code>](#RpcError) 


| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The method that will be called externally |
| params | <code>Object</code> \| <code>Array.&lt;any&gt;</code> | The params that will be passed to the method |

<a name="RpcServiceBase+areParamsValid"></a>

### **rpcServiceBase.areParamsValid(method, params) ⇒ <code>Promise.&lt;boolean&gt;</code> \| <code>boolean</code>**
The abstract that will verify if the provided params for the method are valid,
it should be implemented in all extended classes

**Kind**: instance abstract method of [<code>RpcServiceBase</code>](#RpcServiceBase)  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The method that will be called externally |
| params | <code>Object</code> \| <code>Array.&lt;any&gt;</code> | The params that will be passed to the method |

<a name="RpcWrapper"></a>

## RpcWrapper
Represents the rpc wrapper class that will wrap requests and responses for any object/instance.
This class can be used to rpcify the variables and make them callable through json rpc 2.0 protocol.
Keep in mind that only functions can be invoked, there's no way to invoke getting/setting properties
of object! This instance will act as a proxy to the wrapped object, and can call any function type in object
(with callbacks, async functions and simple functions)

**Kind**: global class  

* [RpcWrapper](#RpcWrapper)
    * [new RpcWrapper(service, [cbMethods])](#new_RpcWrapper_new)
    * [.service](#RpcWrapper+service)
    * [.proxy](#RpcWrapper+proxy)
    * [.cbMethods](#RpcWrapper+cbMethods)
    * [.callReq(payload)](#RpcWrapper+callReq) ⇒ <code>Promise.&lt;(JsonRpcResponse\|Array.&lt;JsonRpcResponse&gt;\|void)&gt;</code>
    * [._procReq(req)](#RpcWrapper+_procReq) ⇒ <code>Promise.&lt;(JsonRpcResponse\|void)&gt;</code>
    * [._createRes([id], [err], [res])](#RpcWrapper+_createRes) ⇒ [<code>JsonRpcResponse</code>](#JsonRpcResponse)
    * [._execFunc(func, params)](#RpcWrapper+_execFunc) ⇒ <code>any</code>

<a name="new_RpcWrapper_new"></a>

### new RpcWrapper(service, [cbMethods])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| service | [<code>RpcServiceBase</code>](#RpcServiceBase) \| <code>Object</code> |  | The object/instance that will be wrapped. It can be any object type    but if it's extension of RpcServiceBase it will validate also params passed to method during the call.    In case if it's a simple object then it should be responsibility of the method itself to validate the    passed arguments. In case it's instance of RpcServiceBase then the service will be stored into service property,    otherwise it will be stored in proxy property |
| [cbMethods] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | Optional methods that use callbacks. Here we should specify all methods    that use callbacks to pass the responses. Each method that has callbacks should support this callback structure:    (err?: Error, res?: any) => void |

**Example**  
```js
// RpcServiceBase extended class
const myService = new ProductService([ { id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' } ])
const rpcProxy = new RpcWrapper(myService)
const payload = '{"jsonrpc":"2.0","method":"find","params":[1],"id":"3"}'
const rpcRes = await rpcProxy.callReq(payload) // '{"jsonrpc":"2.0","id":"3","result":{"id":1,"name":"Product 1"}}'
```
**Example**  
```js
// Object with callback methods
const service1 = {
  storeContent: (content, cb) => {
    fs.writeFile('test.log', content + '\n', { flag: 'a' }, cb)
  }
}
const proxy1 = new RpcWrapper(service1, ['storeContent'])
```
**Example**  
```js
// Simple object
const myService = {
  ping: async () => Date.now(),
  echo: (params) => params,
}
const rpcProxy = new RpcWrapper(myService)
```
<a name="RpcWrapper+service"></a>

### rpcWrapper.service
The service that will be proxied

**Kind**: instance property of [<code>RpcWrapper</code>](#RpcWrapper)  
**Access**: protected  
**Properties**

| Name | Type |
| --- | --- |
| [service] | [<code>RpcServiceBase</code>](#RpcServiceBase) | 

<a name="RpcWrapper+proxy"></a>

### rpcWrapper.proxy
The object that will be proxied

**Kind**: instance property of [<code>RpcWrapper</code>](#RpcWrapper)  
**Access**: protected  
**Properties**

| Name | Type |
| --- | --- |
| [proxy] | <code>Object</code> | 

<a name="RpcWrapper+cbMethods"></a>

### rpcWrapper.cbMethods
Methods of the object that uses callbacks

**Kind**: instance property of [<code>RpcWrapper</code>](#RpcWrapper)  
**Access**: protected  
**Properties**

| Name | Type |
| --- | --- |
| cbMethods | <code>Array.&lt;string&gt;</code> | 

<a name="RpcWrapper+callReq"></a>

### rpcWrapper.callReq(payload) ⇒ <code>Promise.&lt;(JsonRpcResponse\|Array.&lt;JsonRpcResponse&gt;\|void)&gt;</code>
This method invokes the json rpc requests against the wrapped object/instance.
The response can be an array, single item or void depending on request.

**Kind**: instance method of [<code>RpcWrapper</code>](#RpcWrapper)  
**Returns**: <code>Promise.&lt;(JsonRpcResponse\|Array.&lt;JsonRpcResponse&gt;\|void)&gt;</code> - e.g. {"jsonrpc": "2.0", "result": 7, "id": "1"}  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>string</code> | JSON payload that is received through transport layer,    e.g. {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"} |

<a name="RpcWrapper+_procReq"></a>

### rpcWrapper.\_procReq(req) ⇒ <code>Promise.&lt;(JsonRpcResponse\|void)&gt;</code>
Validates the received request and invokes the method on proxied object,
and in case of id param returns the response.

**Kind**: instance method of [<code>RpcWrapper</code>](#RpcWrapper)  
**Returns**: <code>Promise.&lt;(JsonRpcResponse\|void)&gt;</code> - e.g. {"jsonrpc": "2.0", "result": 7, "id": "1"}  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| req | [<code>JsonRpcRequest</code>](#JsonRpcRequest) | Request object received through the proxy call |

<a name="RpcWrapper+_createRes"></a>

### rpcWrapper.\_createRes([id], [err], [res]) ⇒ [<code>JsonRpcResponse</code>](#JsonRpcResponse)
Crafts the json rpc response based on input

**Kind**: instance method of [<code>RpcWrapper</code>](#RpcWrapper)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| [id] | <code>string</code> \| <code>number</code> | Optional request id |
| [err] | [<code>RpcError</code>](#RpcError) | Optional error object |
| [res] | <code>any</code> | Optional response object, ignored in case when err is present |

<a name="RpcWrapper+_execFunc"></a>

### rpcWrapper.\_execFunc(func, params) ⇒ <code>any</code>
Calls the function inside the proxied object with specified arguments

**Kind**: instance method of [<code>RpcWrapper</code>](#RpcWrapper)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>function</code> | The function of the proxied object that will be invoked |
| params | <code>any</code> | The params that will be passed, in case if rpc request is array    params are passed in order, otherwise single object is passed |

<a name="isStringOrNumber"></a>

## isStringOrNumber(val) ⇒ <code>boolean</code>
Determines if the value is primitive string or primitive number,
in case of number NaN and Infinity values are not considered numbers.
It returns true in case of it represents one of these two types

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>any</code> | Value that will be checked |

<a name="isNil"></a>

## isNil(val) ⇒ <code>boolean</code>
Determines if the value is null or undefined, returns true in case of it represents one of these two types

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>any</code> | Value that will be checked |

<a name="getObjectFunctions"></a>

## getObjectFunctions(toCheck) ⇒ <code>Array.&lt;string&gt;</code>
Returns the functions/methods that belong to object, it excludes the object prototype methods:
   - \_\_defineGetter__,
   - \_\_defineSetter__,
   - \_\_lookupGetter__,
   - \_\_lookupSetter__,
   - constructor,
   - hasOwnProperty,
   - isPrototypeOf,
   - propertyIsEnumerable
Methods toLocaleString, toString, valueOf are included

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| toCheck | <code>Object</code> | The object from which the function names will be extracted |

<a name="JsonRpcErrorFields"></a>

## JsonRpcErrorFields : <code>Object</code>
Fields that should be exported during serialization

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| code | <code>number</code> | RpcError code field |
| message | <code>string</code> | Error message field |
| [data] | <code>any</code> | RpcError data field, present only if not nil |

<a name="JsonRpcRequest"></a>

## JsonRpcRequest : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| jsonrpc | <code>&#x27;2.0&#x27;</code> | 
| method | <code>string</code> | 
| [params] | <code>Object</code> \| <code>Array</code> | 
| [id] | <code>string</code> \| <code>number</code> | 

<a name="JsonRpcResponse"></a>

## JsonRpcResponse : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| jsonrpc | <code>&#x27;2.0&#x27;</code> |  |
| [error] | <code>Object</code> |  |
| error.code | <code>number</code> | RpcError code field |
| error.message | <code>string</code> | Error message field |
| [error.data] | <code>any</code> | RpcError data field, present only if not nil |
| [result] | <code>any</code> |  |
| [id] | <code>string</code> \| <code>number</code> |  |

