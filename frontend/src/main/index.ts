import { app, shell, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
    // Create the browser window.
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    });
    const overlay = new BrowserWindow({
        x: 0,
        y: 0,
        width: 200,
        height: 40,
        show: false,
        autoHideMenuBar: true,
        skipTaskbar: true,
        transparent: true,
        frame: false,
        titleBarStyle: 'hidden',
        resizable: false,
        alwaysOnTop: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            devTools: true,
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webSecurity: false,
            additionalArguments: ['overlay']
        }
    })

    overlay.on('ready-to-show', () => {
        // mainWindow.maximize();
        overlay.show();
        overlay.maximize();
        overlay.setIgnoreMouseEvents(true);
    })
    overlay.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        overlay.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        overlay.loadFile(join(__dirname, '../renderer/index.html'))
    }


    const mainWindow = new BrowserWindow({
        x: externalDisplay ? externalDisplay.bounds.x + 50 : 50,
        y: externalDisplay ? externalDisplay.bounds.y + 50 : 50,
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        // skipTaskbar: true,
        // titleBarStyle: 'hidden',
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            devTools: true,
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webSecurity: false,
            additionalArguments: ['main']
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show()
    })
    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
    
}

app.whenReady().then(() => {

    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})