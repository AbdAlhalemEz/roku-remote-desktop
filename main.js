const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { Client } = require('node-ssdp');

let win;

function createWindow() {
  const maxHeight = Math.floor(screen.getPrimaryDisplay().workAreaSize.height * 0.75);

  win = new BrowserWindow({
    width: 360,
    height: 600,
    minWidth: 320,
    minHeight: 480,
    maxHeight: maxHeight,
    frame: false,
    transparent: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('find-roku', async () => {
  return new Promise((resolve) => {
    const client = new Client();
    const foundDevices = [];

    client.on('response', (headers, statusCode, rinfo) => {
      if (headers.ST && headers.ST.includes('roku:ecp')) {
        if (!foundDevices.includes(rinfo.address)) {
          foundDevices.push(rinfo.address);
        }
      }
    });

    client.search('roku:ecp');

    setTimeout(() => {
      client.stop();
      resolve(foundDevices);
    }, 3000);
  });
});
