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
import request from '@ohos.request';

function download(config, resolve, reject) {
    var downloadTask;
    let context = config.context
    let fullPath = buildFullPath(config.baseURL, config.url);

    function settleResult(request, data, code) {
        let response = {
            data: data,
            status: code,
            statusText: "",
            headers: config.header,
            config: config,
            request: request
        };
        settle(function _resolve(value) {
            resolve(value);
        }, function _reject(err) {
            reject(err);
        }, response);
    }
    // url校验
    if (!fullPath) {
        reject(new AxiosError("Cannot read properties of url!", AxiosError.ERR_BAD_OPTION, config, null, null));
        return
    } else if (typeof (fullPath) !== 'string') {
        reject(new AxiosError("Url type should be character type！", AxiosError.ERR_BAD_OPTION_VALUE, config, null, null));
        return
    }
    // 构建配置参数
    let options = {
        url: buildURL(fullPath, config.params, config.paramsSerializer),
        description: 'download file!',
        enableRoaming: true,
        enableMetered: true,
        title: 'download',
        header: config.headers || {}
    }
    // 添加filePath
    if (config.filePath) {
        options.filePath = config.filePath
    }
    // 发送下载请求
    try {
        request.downloadFile(context, options).then((data) => {

            downloadTask = data
            if (typeof config.onDownloadProgress === 'function') {
                downloadTask.on('progress', (loaded, total) => {
                    // onDownloadProgress的参数只有一个progressEvent，构建progressEvent
                    config.onDownloadProgress({
                        loaded: loaded,
                        total: total
                    })
                })
            }

            // 下载失败
            downloadTask.on('fail', function callBack(err) {
                reject(new AxiosError(err.toString(), null, config, request, request));
            });
            // 完成下载
            downloadTask.on('complete', () => {
                settleResult(request, 'download success!', 200)
            })
        }).catch(error => {
            reject(new AxiosError(error, AxiosError.ERR_NETWORK, config, request, request));
        })
    }
    catch(err){
        let s = JSON.stringify(err)
        reject(new AxiosError(err, AxiosError.ERR_BAD_OPTION_VALUE, config, request, request));
    }
}

export default download
