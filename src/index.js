const { app, protocol, BrowserWindow } = require('electron');
const { fstat } = require('fs');
const fs = require('fs');
const path = require('path');
const readFile = (path, option={}) => new Promise((res, rej) => {
  fs.readFile(path, option, (err, data) => {
    if(err) rej(err);
    else res(data);
  });
});
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
protocol.registerSchemesAsPrivileged([{
  scheme:'study',
  privileges:{
    supportFetchAPI: true,
    corsEnabled: true
  }
}]);
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  protocol.registerBufferProtocol('study', async (req, call) => {
    const url = decodeURIComponent(req.url).replace('study://', '');
    if(url.match('download')){
      const str = JSON.parse(req.uploadData[0].bytes.toString());
      const opt = {encoding:'utf-8'};
      const markCSS = await readFile('./src/css/mark.css', opt);
      const vs2015CSS = await readFile('./src/css/vs2015.css', opt);
      const order = ['hash.js', 'promisify.js', 'DB.js', 'initSetting.js', 'init.js'];
      const initJS = [];
      for(let v of order){
        let temp = await readFile(`./src/dev/${v}`, opt);
        temp = temp.replace(/(import|export) (.*)?;/g, '');
        initJS.push(temp);
      }
      const data = `<!doctype html>
      <html><head>
      <meta charset='UTF-8'><meta name='viewport' content='width=device-width initial-scale=1'>
      <title>${str.title}</title>
      <style>${markCSS}</style>
      <style>${vs2015CSS}</style>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/highlight.min.js"></script>
      <script>${initJS.join('')}</script>
      </head>
      <body><article class="markdown-body">${str.raw}</article></body></html>`;
      call({mimeType:'text/html', data: Buffer.from(data)});
    }
  });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
