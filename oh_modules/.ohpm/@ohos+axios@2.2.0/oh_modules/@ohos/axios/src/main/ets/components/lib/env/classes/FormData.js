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
function FormData() {
    let data = {};

    this.append = (name, value, option) => {
        if (!Object.hasOwnProperty.call(data, name)) {
            data[name] = [];
        }
        data[name].push({
            value: value,
            option: option
        })
    }

    this.get = (name) => {
        if (Object.hasOwnProperty.call(data, name)) {
            return data[name][0];
        }
        return undefined;
    }

    this.has = (name) => {
        return Object.hasOwnProperty.call(data, name);
    }

    this.delete = (name) => {
        return delete data[name];
    }

    this.set = (name, value, option) => {
        data[name] = [];
        data[name].push({
            value: value,
            option: option
        })
    }

    this.forEach = (callback) => {
        for (let prop in data) {
            for (let item of data[prop]) {
                callback(item.value, prop, item.option)
            }
        }
    }
}

export default FormData;
