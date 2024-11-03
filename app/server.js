const http = require("http");
const fs = require("fs");
const path = require("path");

let balance = 10000;  // Initial balance
let stocks = [];      // Array to hold stock investments

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/invest") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const { symbol, amount } = JSON.parse(body);
            amount = parseFloat(amount);

            if (amount > balance) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Insufficient funds" }));
                return;
            }

            balance -= amount;
            stocks.push({ symbol, amount });

            const response = {
                balance: balance.toFixed(2),
                stocks: stocks
            };
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(response));
        });
    } else if (req.method === "GET" && req.url.startsWith("/")) {
        const filePath = path.join(__dirname, "public", req.url === "/" ? "invest.html" : req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".wav": "audio/wav",
            ".mp4": "video/mp4",
            ".woff": "application/font-woff",
            ".ttf": "application/font-ttf",
            ".eot": "application/vnd.ms-fontobject",
            ".otf": "application/font-sfnt",
            ".ico": "image/x-icon"
        };

        const contentType = mimeTypes[extname] || "application/octet-stream";
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end(`Sorry, there was an error: ${error.code}`);
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content, "utf-8");
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
