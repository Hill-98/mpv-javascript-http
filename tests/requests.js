// noinspection HttpUrlsUsage

module.exports = [
    {
        method: 'GET',
        url: 'http://127.0.0.1:18066/hello',
        options: {},
        response: {
            data: 'hello world!',
            status_code: 200,
        },
    },
    {
        method: 'GET',
        url: 'http://127.0.0.1:18066/hello-cookies',
        options: {
            cookies: {
                first_name: 'first',
                last_name: 'last',
            },
        },
        response: {
            data: 'hello first last! (cookies)',
            status_code: 200,
        },
    },
    {
        method: 'GET',
        url: 'http://127.0.0.1:18066/hello-headers',
        options: {},
        response: {
            data: 'hello headers!',
            headers: {
                first_name: ['first'],
                last_name: ['last'],
            },
            status_code: 200,
        },
    },
    {
        method: 'GET',
        url: 'http://127.0.0.1:18066/hello-redirect',
        options: {},
        response: {
            data: '',
            status_code: 204,
        },
    },
    {
        method: 'POST',
        url: 'http://127.0.0.1:18066/hello-data',
        options: {
            data: {
                first_name: 'first',
                last_name: 'last',
            },
        },
        response: {
            data: 'hello first last! (data)',
            status_code: 200,
        },
    },
    {
        method: 'POST',
        url: 'http://127.0.0.1:18066/hello-form-data',
        options: {
            form_data: {
                first_name: 'first',
                last_name: 'last',
            },
        },
        response: {
            data: 'hello first last! (form-data)',
            status_code: 200,
        },
    },
    {
        method: 'POST',
        url: 'http://127.0.0.1:18066/hello-json-data',
        options: {
            json_data: {
                first_name: 'first',
                last_name: 'last',
            },
        },
        response: {
            data: 'hello first last! (json data)',
            status_code: 200,
        },
    },
    {
        method: 'POST',
        url: 'http://127.0.0.1:18066/hello-raw-data',
        options: {
            data: 'first last',
            headers: {
                'Content-Type': 'text/plain',
            },
        },
        response: {
            data: 'hello first last! (raw-data)',
            status_code: 200,
        },
    },
    {
        method: 'POST',
        url: 'http://127.0.0.1:18066/hello-json',
        options: {
            json_data: {
                first_name: 'first',
                last_name: 'last',
            },
        },
        response: {
            data: {
                first_name: 'first',
                last_name: 'last',
            },
            raw_data: '{"first_name":"first","last_name":"last"}',
            status_code: 200,
        },
    },
];
