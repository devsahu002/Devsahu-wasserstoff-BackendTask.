const http = require('http');
const QueueManager = require('./queueManager');

const queueManager = new QueueManager();

const processQueue = (queueType) => {
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
        let { apiType, req, res ,targetServer} = nextRequest;
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
        
                    res.json({
                        message: resFromTargetServer.message,
                        analyticsData :analyticsData
                });
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

const loadBalancer = (req, res,targetServer) => {
     const { apiType, queueType, priority=1 } = req.body;  // if priority is not sent from the client side than default priority is 1
    const request = { apiType, req, res ,targetServer };
    switch (queueType) {
        case 'FIFO':
            queueManager.addToFifoQueue(request);
            break;
        case 'PRIORITY':
            queueManager.addToPriorityQueue(request, priority);
            break;

        default:
            res.json({ errorMessage: 'Invalid queue type' });
    }
    processQueue(queueType);
};

module.exports = loadBalancer;
