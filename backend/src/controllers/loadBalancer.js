const http = require('http');
const url = require('url');
const QueueManager = require('./queueManager');

const apiEndpoints = [
    { type: 'REST', url: 'http://localhost:3001' },
    { type: 'GraphQL', url: 'http://localhost:3002' },
    { type: 'gRPC', url: 'http://localhost:3003' },
];
let currentServerIndex = 0 

const queueManager = new QueueManager();

const getRandomEndpoint = () => {
    const index = Math.floor(Math.random() * apiEndpoints.length);
    return apiEndpoints[index];
};

const processQueue = (queueType,route) => {
    let nextRequest;
    switch (queueType) {
        case 'FIFO':
            nextRequest = queueManager.getNextFromFifoQueue();
            break;
        case 'PRIORITY':
            nextRequest = queueManager.getNextFromPriorityQueue();
            break;
        default:
            return;
    }

    if (nextRequest) {
        let { apiType, req, res } = nextRequest;
        let targetServer = null
        switch(route){
            case "/apiTypeBased":{
             targetServer = apiEndpoints.find(ep => ep.type === apiType) || getRandomEndpoint();
                break
            }
            case "/random":{
                targetServer = getRandomEndpoint();
                break
            }
            case "/roundRobin":{
                targetServer =  apiEndpoints[currentServerIndex];
                currentServerIndex = (currentServerIndex + 1) % apiEndpoints.length;
                break
            }
            default :
                break
        }
            const startTime = Date.now();
    
            const proxyReq = http.request(targetServer.url, proxyRes => {
                let responseData = '';
                proxyRes.on('data', chunk => {
                    responseData += chunk;
                });
                proxyRes.on('end', () => {
                    const duration = Date.now() - startTime;
                    const analyticsData = `Request to ${targetServer.url} took ${duration}ms`
                    console.log(analyticsData);
                    console.log(`Queue type: ${queueType}, API type: ${apiType}, Duration: ${duration}ms`);
                    const resFromTargetServer = JSON.parse(responseData)
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(JSON.stringify({
                        message : resFromTargetServer.message,
                        analyticsData :analyticsData
                    }));
                });
            });
    
            proxyReq.on('error', err => {
                console.error('Error with proxy request:', err.message);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            });
            proxyReq.end();
    }
};

const loadBalancer = (req, res) => {
    const { method, url: reqUrl } = req;
    const parsedUrl = url.parse(reqUrl, true);
    const route = parsedUrl.pathname
    if (method === 'POST' && ["/apiTypeBased","/random","/roundRobin"].includes(route)) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { apiType, queueType, priority } = JSON.parse(body);
            res.asd =  Date.now() 
            const request = { apiType, req, res };
            switch (queueType) {
                case 'FIFO':
                    queueManager.addToFifoQueue(request);
                    break;
                case 'PRIORITY':
                    queueManager.addToPriorityQueue(request, priority);
                    break;
                
                default:
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Invalid queue type');
                    return;
            }
            // res.writeHead(202, { 'Content-Type': 'text/plain' });
            // res.end('Request accepted');

            processQueue(queueType,route);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
};

module.exports = loadBalancer;
