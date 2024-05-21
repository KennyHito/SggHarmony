/*
 * The MIT License (MIT)
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */
'use strict';

import buildURL from '../../../lib/helpers/buildURL.js'
import buildFullPath from '../../../lib/core/buildFullPath'
import settle from "../../../lib/core/settle"
import AxiosError from '../../../lib/core/AxiosError'
import http from '@ohos.net.http'
import utils from '../../utils'

function setOptions(config){
    let options = {
        method: config.method.toUpperCase(),
        header: config.headers, // 开发者根据自身业务需要添加header字段
        maxLimit: -1 // 默认放开http request的5MB限制，在axios层的maxBodyLength进行长度限制
    }
    // 设置请求体
    if (!utils.isUndefined(config.data)) { // 当使用POST请求时此字段用于传递内容
        options.extraData = config.data
    }
    // 设置读取超时
    if (utils.isNumber(config.timeout)) {
        options.readTimeout = config.timeout
    }
    // 设置responseType
    if(!utils.isUndefined(config.responseType)){
        let responseType = config.responseType.toUpperCase()
        switch (responseType) {
            case 'STRING':
                options.expectDataType = 0
                break;
            case 'OBJECT':
                options.expectDataType = 1
                break;
            case 'ARRAY_BUFFER':
                options.expectDataType = 2
                break;
        }
    }

    // 设置优先级
    if(utils.isNumber(config.priority)){
        options.priority = config.priority
    }
    // 设置caPath
    if(config.caPath){
        options.caPath = config.caPath
    }
    // 设置客户端证书
    if(!utils.isUndefined(config.clientCert)){
        options.clientCert = config.clientCert
        // keyPasswd转换为keyPassword
        let { keyPasswd: keyPassword, ...rest } = options.clientCert;
        let clientCert = { ...rest, keyPassword };
        // certType转换为大小字符
        let certType =  clientCert.certType
        clientCert.certType = certType ?  certType.toUpperCase() :  certType
        options.clientCert = clientCert
    }
    // 设置代理
    if(!utils.isUndefined(config.proxy)){
        options.usingProxy = config.proxy
    }
    return options
}



export default (config, resolve, reject) => {
    let fullPath = buildFullPath(config.baseURL, config.url);

    // 每一个httpRequest对应一个http请求任务，不可复用
    let httpRequest = http.createHttp();
    let options = setOptions(config)

    if (!fullPath) {
        reject(new AxiosError("Cannot read properties of url!", AxiosError.ERR_BAD_OPTION, config, httpRequest, httpRequest));
        return
    } else if (typeof (fullPath) !== 'string') {
        reject(new AxiosError("Url type should be character type！", AxiosError.ERR_BAD_OPTION, config, httpRequest, httpRequest));
        return
    }
    httpRequest.request(
        // 填写http请求的url地址，可以带参数也可以不带参数。URL地址需要开发者自定义。GET请求的参数可以在extraData中指定
        buildURL(fullPath, config.params, config.paramsSerializer), options
        , (err, data) => {
        if (!err) {
            let response = {
                data: data && data.result,
                status: data && data.responseCode,
                statusText: "",
                headers: data && data.header,
                config: config,
                request: httpRequest
            };
            settle(function _resolve(value) {
                resolve(value);
            }, function _reject(err) {
                reject(err);
            }, response);
        } else {
            // 无网络或者url错误
            reject(new AxiosError(JSON.stringify(err), err.code, config, httpRequest, httpRequest));
        }
        httpRequest.destroy();
    });
}



