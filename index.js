import http from "node:http";
import fs from "node:fs/promises";

const routes = {
    "/": "index.html",
    "/about": "about.html",
    "/contact-me": "contact-me.html",
    "404": "404.html",
};

async function preloadFiles() {
    const data = await Promise.all(
        Object.entries(routes).map(([key, path]) =>
            fs
                .readFile(path, { encoding: "utf8" })
                .then((data) => [key, data])
                .catch((err) => {
                    console.error(err);
                    return [key, null];
                })
        )
    );

    return Object.fromEntries(data);
}

const cachedFiles = preloadFiles();

const server = http.createServer(async (req, res) => {
    const files = await cachedFiles;

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (files[req.url]) {
        res.statusCode = 200;
        res.end(files[req.url]);
    } else if (req.url in files) {
        res.statusCode = 500;
        res.end("Server error");
    } else {
        res.statusCode = 404;
        res.end(files["404"] || "Not found");
    }
});

server.listen(8080);
