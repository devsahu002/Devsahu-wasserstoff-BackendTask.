const http = require('http');

const createServer = (port, message) => {
    return http.createServer((req, res) => {
            setTimeout(() => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message }));
            }, Math.random() * 1000);
    }).listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

module.exports = createServer;
