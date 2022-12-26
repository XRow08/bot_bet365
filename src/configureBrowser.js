const http = require('http');

http.get({
    hostname: "localhost",
    port: 9222,
    path: "/json/version"
}, (res) => {
    res.on('data', (data) => {
        console.log(JSON.parse(data).webSocketDebuggerUrl)
    })
})