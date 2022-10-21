# mpv-javascript-http

Http client for mpv scripts (based on curl).

_Windows 10/11 already has `curl.exe` built in, so it's almost all platform compatible._

## Example

```javascript
'use strict';

var msg = mp.msg;
var HttpClient = require('./HttpClient');

var http = new HttpClient();

// Check if the system has curl
if (!HttpClient.available) {
    msg.error('HTTP client unavailable!');
    exit();
}

http.get('https://jsonplaceholder.typicode.com/todos/1', function (err, res) {
    if (err) {
      msg.error(err);
      return;
    }
    dump(res.data.id); // Auto parse json data
    dump(res.headers);
    dump(res.raw_data);
    dump(res.status_code);
});
```
