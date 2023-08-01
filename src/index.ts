/* eslint-disable @typescript-eslint/ban-ts-comment */
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import fs from "fs";
import util from "util";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Hanlde file rename from old path to new path
  ipcMain.handle("renameFile", async (event, oldPath, newPath) => {
    const rename = util.promisify(fs.rename);
    console.log(`Renaming ${oldPath} to ${newPath}`)
    return await rename(oldPath, newPath);
  });

  // Handle dialog requests from the renderer process
  ipcMain.handle("dialog", async (event, method, params) => {
    // @ts-ignore
    return await dialog[method](params);
  });

  // Return all file paths for specified folder path
  ipcMain.handle("listFiles", async (event, path) => {
    const readdir = util.promisify(fs.readdir);
    const stat = util.promisify(fs.stat);
    const files = await readdir(path);
    const filesWithStats = await Promise.all(files.map(async (file: string) => {
      const filePath = `${path}/${file}`;
      const fileStat = await stat(filePath);
      return {
        name: file,
        path: filePath,
        isDirectory: fileStat.isDirectory(),
        size: fileStat.size
      };
    }));
    return filesWithStats;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
