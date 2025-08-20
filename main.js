const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
// 数据文件存储在应用程序目录下的 data.json 文件中
// 这样用户可以直接找到并编辑这个文件
let dataPath = path.join(__dirname, 'data.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450, // Increased width
    height: 700, // Adjusted height
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: false, // Prevent resizing to avoid scroll bars
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // 如果数据文件不存在，从模板创建一个新的
  if (!fs.existsSync(dataPath)) {
    const defaultData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
    fs.writeFileSync(dataPath, defaultData);
  }
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-data', async (event) => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
});

ipcMain.handle('save-data', async (event, data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
});

ipcMain.handle('copy-to-clipboard', async (event, text) => {
  clipboard.writeText(text);
});

ipcMain.handle('toggle-always-on-top', async (event) => {
    const isAlwaysOnTop = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(isAlwaysOnTop);
    return isAlwaysOnTop;
});

ipcMain.handle('close-app', () => {
    app.quit();
});