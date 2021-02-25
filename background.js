
import { app, protocol, BrowserWindow,session,ipcMain  } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import path from 'path'
import Vue from 'vue'

Vue.prototype.$electron = require('electron')
let loadingWindow,
win;
const loadingURL = process.env.NODE_ENV === 'development'  //加载loading.html页面地址
  ? path.join(__dirname, '../src/assets/loading.html')
  : `file://${__dirname}/index.html`


protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
function createLoadingWindow() {   //加载页面窗口
  loadingWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 600,
    show: true,
    transparent:false,
    maximizable: false,  //禁止双击放大
    webPreferences: {
      nodeIntegration:true
    }
  
  })
 
  loadingWindow.loadURL(loadingURL)
 
  loadingWindow.on('closed', () => {
    loadingWindow = null
  })
}

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 600,
    show: false,
    transparent:false,
    maximizable: false,  //禁止双击放大
    webPreferences: {
      nodeIntegration:true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    // //   console.log(1111,path.resolve('chrome'))
    // //  await session.defaultSession.loadExtension(path.resolve('chrome'))
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
    createLoadingWindow()
  // }
  createWindow()
  ipcMain.on('close-loading-window', (e,res) => {
    console.log('e', e)
    console.log('res', res)
    if (res.isClose) {
      // console.log(33333,loadingWindow)
      loadingWindow.close()
      win.show()
    }
  })

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
