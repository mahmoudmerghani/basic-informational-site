import express from "express";
import fs from "node:fs/promises";

const app = express();

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
                    console.error(`Error reading ${path}:`, err);
                    return [key, null];
                })
        )
    );

    return Object.fromEntries(data);
}

async function startServer() {
    const files = await preloadFiles();

    app.get("/", (req, res) => {
        if (files["/"]) {
            res.type("html").send(files["/"]);
        } else {
            res.type("json").status(500).send("Server error");
        }
    });

    app.get("/about", (req, res) => {
        if (files["/about"]) {
            res.type("html").send(files["/about"]);
        } else {
            res.type("json").status(500).send("Server error");
        }
    });

    app.get("/contact-me", (req, res) => {
        if (files["/contact-me"]) {
            res.type("html").send(files["/contact-me"]);
        } else {
            res.type("json").status(500).send("Server error");
        }
    });

    app.use((req, res) => {
        res.status(404)
            .type("html")
            .send(files["404"] || "Not Found");
    });

    app.listen(8080, () => {
        console.log("Server running on http://localhost:8080");
    });
}

startServer();
