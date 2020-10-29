const express = require('express');
const path = require('path');
const fs = require('fs');
const { networkInterfaces } = require('os');

class Server {
    constructor(port, app, appPath) {
        this.port = port;
        this.app = app;
        this.path;

        this.app.use(express.static(path.join(appPath, 'client')));
    }

    setPath(path) {
        if (!fs.existsSync(path)) {
            throw new Error("The path specified does not exist.");
        } else {
            this.path = path;
        }
    }

    getFiles() {
        this.app.get("/media/:file", (req, res, next) => {
            // Check if the folder is set
            if (!this.path) {
                return res.status(404).send();
            }
            // Get the filename
            const filename = req.params.file;
            // Get the absolute path to the file
            const absPath = path.join(this.path, filename);
            if (fs.existsSync(absPath)) {
                res.sendFile(absPath);
            } else {
                res.status(404).send();
            }
        });
        this.app.get("/media", (req, res, next) => {
            // Check if the folder is set
            if (!this.path) {
                return res.status(404).send();
            }
            res.send(JSON.stringify({ paths: getFileNamesFromDir(this.path) }));
        })
        this.app.get("/ip", (req, res, next) => {
            res.send(getLocalExternalIPs());
        });

    }

    listen() {
        this.getFiles();
        this.app.listen(this.port, (err) => {
            if (err) {
                console.log(err);
            } else {
                // open(`http://localhost:${this.port}`);
            }

        });
    }
}

const getLocalExternalIPs = () => {
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }

    return results;
}

module.exports = { Server }

function getFileNamesFromDir(folderPath) {
    let filePaths = [];
    let dir = fs.readdirSync(folderPath);
    for (let filePath of dir) {
        let absPath = path.join(folderPath, filePath);
        if (fs.lstatSync(absPath).isDirectory()) continue;
        filePaths.push(filePath);
    }
    return filePaths;
}