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
import { deleteFile, writeFile } from '../../fileFs'
import request from '@ohos.request';

const axios_temp = 'axios_temp'

/**
 * 获取 file 和 data
 * 1.如果是uri，直接从config.data中取值并且返回
 * 2.如果是ArrayBuffer，存储到本地临时目录并且返回路径
 * 3.如果是字符，存储到本地临时目录并且返回路径
 * @param requestData
 * @param reject
 */
function getFileList(requestData, reject, cacheDir) {
    let files = []
    let data = []
    requestData.forEach((value, key, option) => {
        if (typeof (value) === 'string' && (value.indexOf('internal://') == 0)) { // uri
            let filename = getFileNameByPath(value)
            let type = getType(filename)
            files.push({
                filename: filename || '',
                name: key,
                uri: value,
                type: type || ''
            })
        }
        else if (value instanceof ArrayBuffer) { // ArrayBuffer
            // 将arrayBuffer暂存至本地目录
            let defaultName = "default" + Date.now();
            let name = option && typeof (option) === 'string' ? option : defaultName;
            try {
                writeFile(`${cacheDir}/${axios_temp}`, name, value)
            } catch (err) {
                reject(new AxiosError('The file operation failed with error message: ' + JSON.stringify(err), AxiosError.ERR_BAD_OPTION, null, null, null));
            }
            files.push({
                filename: name,
                name: key,
                uri: `internal://cache/${axios_temp}/${name}`,
                type: ''
            })
        } else {
            data.push({
                name: key,
                value: value
            })
        }
    })
    return {
        files: files,
        data: data
    }
}


/**
 * 根据已知文件路径，获取文件名。例如输入: internal://cache/temp.jpg, 输出: temp.jpg
 * path: 文件路径
 */
function getFileNameByPath(path) {
    let index = path.lastIndexOf("/");
    let fileName = path.substr(index + 1);
    return fileName;
}

/**
 * 根据已知文件路径，获取后缀名
 * path: 文件路径
 */
function getType(filename) {
    if (!filename) return ''
    let index = filename.lastIndexOf(".");
    let type = index > -1 ? filename.substr(index + 1) : '';
    return type;
}

/**
 * 上传
 * @param config 配置项
 * @param resolve
 * @param reject
 */
async function upload(config, resolve, reject) {
    let uploadTask;
    let context = config.context
    let requestData = config.data;
    let fullPath = buildFullPath(config.baseURL, config.url);

    // 根据Stage模型和FA模型分别获取临时缓存目录
    let cacheDir = ''
    if (!context || !requestData) reject(new AxiosError('Cannot read properties, please check the parameters!', AxiosError.ERR_BAD_OPTION, null, null, null));
    try {
        if (context.cacheDir) {
            cacheDir = context.cacheDir
        } else {
            let result = await context.getCacheDir()
            cacheDir = result ? result : reject(new AxiosError('Cannot read properties, please check the parameters!', AxiosError.ERR_BAD_OPTION, null, null, null));
        }
    } catch (err) {
        reject(new AxiosError(err, AxiosError.ERR_BAD_OPTION, null, null, null));
    }
    // 每次上传前清理异常导致的残留文件
    deleteFile(cacheDir)

    // 构建upload请求参数
    let list = getFileList(requestData, reject, cacheDir)

    let options = {
        url: buildURL(fullPath, config.params, config.paramsSerializer),
        header: config.headers,
        method: config.method.toUpperCase(),
        files: list.files,
        data: list.data,
    }
    // 发送upload请求
    try {
        request.uploadFile(context, options).then((data) => {
            uploadTask = data
            let responseHeader ;
            if (typeof config.onUploadProgress === 'function') {
                uploadTask.on('progress', (loaded, total) => {
                    config.onUploadProgress({
                        loaded: loaded,
                        total: total
                    })
                })
            }
            // headerReceive
            uploadTask.on('headerReceive', (header) => {
                responseHeader = header
            });
            // upload complete
             uploadTask.on('complete', () => {
                 if (responseHeader) {
                     let response = {
                         data: responseHeader.body || '',
                         status: 200,
                         statusText: "",
                         headers: responseHeader.headers || '',
                         config: config,
                         request: request
                     };
                     settle(function _resolve(value) {
                         resolve(value);
                     }, function _reject(err) {
                         reject(err);
                     }, response);
                     deleteFile(cacheDir, options)
                 }
             })
            // upload fail
            uploadTask.on('fail', (err) => {
                let message = err && err[0] ? err[0].message : '';
                let code = err && err[0] ? err[0].responseCode : '';
                reject(new AxiosError(message, code, config, null, null));
            })

        }).catch(error => {
            reject(new AxiosError(error, AxiosError.ERR_NETWORK, config, null, null));
        })
    }catch (err){
        reject(new AxiosError(err, AxiosError.ERR_BAD_OPTION_VALUE, config, null, null));
    }
}

export default upload
