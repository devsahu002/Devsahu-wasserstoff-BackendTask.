const http = require('http');

const createServer = (port, message) => {
    return http.createServer((req, res) => {
        if (req.method === 'GET') {
            setTimeout(() => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message }));
            }, Math.random() * 1000);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    }).listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

module.exports = createServer;
