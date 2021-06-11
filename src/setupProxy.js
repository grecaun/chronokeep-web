const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
    require('dotenv').config()

    const apiUrl = process.env.REACT_APP_CHRONOKEEP_API_URL;
    const apiToken = process.env.REACT_APP_CHRONOKEEP_ACCESS_TOKEN;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiToken
    }

    // define the route and map the proxy
    app.use('/api', createProxyMiddleware({
        target: apiUrl,
        changeOrigin: false,
        pathRewrite: {
            '^/api/':'/'
        },
        headers: headers
    }))
};