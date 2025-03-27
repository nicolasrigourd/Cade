const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Cargando index en:', indexPath);

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(indexPath);
  win.webContents.openDevTools(); // Abre automáticamente las DevTools para depurar
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
