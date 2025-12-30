'use strict'

import path from 'path'
import { app, protocol, BrowserWindow, ipcMain, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		title: "Taiga Export",
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	win.setMenuBarVisibility(false);
	const isAllowedNavigation = (url) => {
		try {
			const parsedUrl = new URL(url);
			if (parsedUrl.protocol === 'app:') return true;
			if (isDevelopment && process.env.WEBPACK_DEV_SERVER_URL) {
				const devOrigin = new URL(process.env.WEBPACK_DEV_SERVER_URL).origin;
				return parsedUrl.origin === devOrigin;
			}
			return false;
		} catch (error) {
			return false;
		}
	};
	const openExternalIfSafe = (url) => {
		try {
			const parsedUrl = new URL(url);
			if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
				shell.openExternal(url);
			}
		} catch (error) {
			// Ignore malformed URLs.
		}
	};
	win.webContents.on('will-navigate', function (e, url) {
		if (isAllowedNavigation(url)) return;
		e.preventDefault();
		openExternalIfSafe(url);
	});
	win.webContents.setWindowOpenHandler(({ url }) => {
		openExternalIfSafe(url);
		return { action: 'deny' };
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		win.loadURL('app://./index.html')
	}

	initIpc();
}

function initIpc() {
	ipcMain.handle('fetch-attachment', async (_event, arg) => {
		const { url } = arg;
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch (error) {
			throw new Error('Invalid attachment URL.');
		}
		if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
			throw new Error('Only HTTP(S) URLs are allowed for attachments.');
		}

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch attachment (status ${response.status}).`);
		}

		return response.arrayBuffer();
	});
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
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS3_DEVTOOLS)
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString())
		}
	}
	createWindow()
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
