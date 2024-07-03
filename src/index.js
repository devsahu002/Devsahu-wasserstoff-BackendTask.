const http = require('http');
const loadBalancer = require('./controllers/loadBalancer');
const express = require("express")
const app = express()

app.use(express.json({}))

const server1 = express()
const server2 = express()
const server3 = express()


// Load BalancerServerPort
const loadBalancerPort = 3000;

// Mock servers mapper
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
// This will act as a load balancer server which will rediect all incoming request to different servers
app.listen(loadBalancerPort,()=>{
    console.log(`Load balancer is running on port ${loadBalancerPort}`);
})

// Below are the end point url to which requests will be redirected
const apiEndpoints = [
    { type: 'REST', url: 'http://localhost:3001' },
    { type: 'GraphQL', url: 'http://localhost:3002' },
    { type: 'gRPC', url: 'http://localhost:3003' },
];
let currentServerIndex = 0 

// function to select a random server among available servers
const getRandomEndpoint = () => {
    const index = Math.floor(Math.random() * apiEndpoints.length);
    return apiEndpoints[index];
};

//Below is the code snippet where main servers are handlind the req from the load balancer server
app.use("/random",(req,res)=>{
    const targetServer = getRandomEndpoint();
    console.log(req.body)
    loadBalancer(req,res,targetServer)
})
app.use("/apiTypeBased",(req,res)=>{
    const {apiType=""} = req.body
    const targetServer = apiEndpoints.find(ep => ep.type === apiType) || getRandomEndpoint();
    loadBalancer(req,res,targetServer)
})
app.use("/roundRobin",(req,res)=>{
    const targetServer = targetServer =  apiEndpoints[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % apiEndpoints.length;
    loadBalancer(req,res,targetServer)
})

// Below are the main server to which our routes will be redirected

server1.listen(servers[0].port,()=>{
    console.log(`Server running on port ${servers[0].port}`);
})
server2.listen(servers[1].port,()=>{
    console.log(`Server running on port ${servers[1].port}`);
})
server3.listen(servers[2].port,()=>{
    console.log(`Server running on port ${servers[1].port}`);
})

// Below are the req's handled from the load balancer server
server1.use("/", (req, res) => {
    const serverName = servers[0].name
    setTimeout(() => {
        res.json({ message : `Response From Server ${serverName}` });
    }, Math.random() * 1000);
})
server2.use("/", (req, res) => {
    const serverName = servers[1].name
    setTimeout(() => {
        res.json({ message : `Response From Server ${serverName}` });
    }, Math.random() * 1000);
})
server3.use("/", (req, res) => {
    const serverName = servers[2].name
    setTimeout(() => {
        res.json({ message : `Response From Server ${serverName}` });
    }, Math.random() * 1000);
})
