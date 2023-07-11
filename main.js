const { BrowserWindow, app, ipcMain, dialog, Notification, Menu } = require("electron");
const path = require('path');
const fs = require("fs");

let mainWindow;
let openedFilePath;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        titleBarStyle: "hidden",
        webPreferences: {
            preload: path.join(app.getAppPath(), "renderer.js"),
            sandbox: false
        }
    });

    if (process.env.NODE_ENV==="development") {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile("index.html");

    const menuTemplate = [{
        label: "File",
        submenu: [
            {
                label: "Add New File",
                click: () => ipcMain.emit("open-document-triggered")
            },
            {
                label: "Create New File",
                click: () => ipcMain.emit("create-document-triggered")
            }
        ],
        
    },
    {
        role: "editMenu"
    },
    {
        role: "quit"
    }];
    const menu = Menu.buildFromTemplate(menuTemplate);
    mainWindow.setMenu(menu);
}

app.whenReady().then(createWindow);


function handleError() {
    new Notification({
        title: "Error",
        body: "Sorry, something went wrong"
    }).show();
}

ipcMain.on("create-document-triggered", () => {
    dialog.showSaveDialog(mainWindow, {
        filters: [{name: "text files", extensions: ["txt"]}]
    }).then(({ filePath }) => { 
        console.log(":", filePath);
        openedFilePath = filePath;

        fs.writeFile(filePath, "", (error) => {
            if (error) {
                handleError();
            } else {
                app.addRecentDocument(filePath)
                mainWindow.webContents.send("document-created", filePath);
            }
        });
    });
});

ipcMain.on("open-document-triggered", () => {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "text files", extenstions: ["txt"]}]
    }).then(({filePaths}) => {
        const filePath = filePaths[0];

        fs.readFile(filePath + "hehe", "utf-8", (error, content) => {
            if (error) {
                handleError();
            } else {
                app.addRecentDocument(filePath)
                openedFilePath = filePath;
                mainWindow.webContents.send("document-opened", { filePath, content});
            }
        });
    });
});

ipcMain.on("save-document", (_, textAreaContent) => {
    if (openedFilePath === undefined) { return; }
    fs.writeFile(openedFilePath, textAreaContent, (error) => {
        if (error) {
            handleError();
        } else {
            console.log("saved");
        }
    });
});