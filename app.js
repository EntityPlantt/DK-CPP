const { app, BrowserWindow, dialog } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");

var window;
if (handleSquirrelEvent())
	return;
function createWindow() {
	const win = new BrowserWindow({
		width: 500,
		height: 500,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js")
		},
		backgroundColor: "#0b0b0b",
		autoHideMenuBar: true
	});
	win.maximize();
	win.loadFile("index.html");
	win.webContents.on("did-finish-load", () => {
		win.show();
	});
	return win;
}
app.whenReady().then(() => {
	window = createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length == 0) {
			createWindow();
		}
	});
});
app.on("window-all-closed", () => {
	if (process.platform != "darwin") {
		app.quit();
	}
});
ipcMain.on("show-open-dialog", (event, filePath) => {
	var path = dialog.showOpenDialogSync(window, {
		defaultPath: filePath,
		title: "Edit C++ File",
		buttonLabel: "Edit",
		filters: [
			{
				name: "C++ Source",
				extensions: ["cpp", "cxx", "c++"]
			},
			{
				name: "C++ Header",
				extensions: ["h", "hpp", "hxx", "h++"]
			},
			{
				name: "Any file",
				extensions: ["*"]
			}
		]
	});
	event.reply("collect-open-dialog", path ? path[0] : path);
});
ipcMain.on("show-save-dialog", (event, filePath) => {
	var result = dialog.showSaveDialogSync(window, {
		defaultPath: filePath,
		title: "Save C++ File",
		icon: "icon.ico",
		buttonLabel: "Save",
		filters: [
			{
				name: "C++ Source",
				extensions: ["cpp", "cxx", "c++"]
			},
			{
				name: "C++ Header",
				extensions: ["h", "hpp", "hxx", "h++"]
            },
			{
				name: "Any file",
				extensions: ["*"]
            }
		]
	});
	event.reply("collect-save-dialog", result);
});
function handleSquirrelEvent() {
	if (process.argv.length == 1) {
		return false;
	}
	const ChildProcess = require('child_process');
	const path = require('path');
	const appFolder = path.resolve(process.execPath, '..');
	const rootAtomFolder = path.resolve(appFolder, '..');
	const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
	const exeName = path.basename(process.execPath);
	const spawn = (command, args) => {
		let spawnedProcess, error;
		try {
			spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
		} catch (error) { }
		return spawnedProcess;
	};
	const spawnUpdate = function (args) {
		return spawn(updateDotExe, args);
	};
	const squirrelEvent = process.argv[1];
	switch (squirrelEvent) {
		case '--squirrel-install':
		case '--squirrel-updated':
			// Optionally do things such as:
			// - Add your .exe to the PATH
			// - Write to the registry for things like file associations and
			//   explorer context menus
			// Install desktop and start menu shortcuts
			spawnUpdate(['--createShortcut', exeName]);
			setTimeout(app.quit, 1000);
			return true;

		case '--squirrel-uninstall':
			// Undo anything you did in the --squirrel-install and
			// --squirrel-updated handlers
			// Remove desktop and start menu shortcuts
			spawnUpdate(['--removeShortcut', exeName]);
			setTimeout(app.quit, 1000);
			return true;

		case '--squirrel-obsolete':
			// This is called on the outgoing version of your app before
			// we update to the new version - it's the opposite of
			// --squirrel-updated
			app.quit();
			return true;
	}
};
