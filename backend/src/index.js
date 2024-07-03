const http = require('http');
const loadBalancer = require('./controllers/loadBalancer');
const createServer = require('./controllers/mockApi');

// Load Balancer
const loadBalancerPort = 3000;
http.createServer(loadBalancer).listen(loadBalancerPort, () => {
    console.log(`Load balancer is running on port ${loadBalancerPort}`);
});

// Mock APIs
const servers = [
    {
        port : 3001,
        name:"Server A"
    },
    {
        port : 3002,
        name:"Server B"
    },
    {
        port : 3003,
        name:"Server C"
    }
]
createServer(servers[0].port, `Response from ${servers[0].name}`);
createServer(servers[1].port, `Response from ${servers[1].name}`);
createServer(servers[2].port, `Response from ${servers[2].name}`);
