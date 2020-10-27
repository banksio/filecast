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
            res.send(getLocalExternalIP());
        });

    }
    
	listen() {
        this.getFiles();
		this.app.listen(this.port, (err) =>{
			if(err){
				console.log(err);
			} else {
				// open(`http://localhost:${this.port}`);
			}

		});
	}
}

const getLocalExternalIP = () => [].concat(...Object.values(networkInterfaces()))
  .find((details) => details.family === 'IPv4' && !details.internal)
  .address

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