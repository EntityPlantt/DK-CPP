const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron"), path = require("path");
const menuTemplate = [
	{
		label: "File",
		submenu: [
			{ label: "New", action: "new", accelerator: "CmdOrCtrl+N" },
			{ type: "separator" },
			{ label: "Open", action: "open", accelerator: "CmdOrCtrl+O" },
			{ label: "Save", action: "save", accelerator: "CmdOrCtrl+S" },
			{ label: "Save As", action: "save-as", accelerator: "CmdOrCtrl+Shift+S" }
		]
	},
	{
		label: "Project",
		submenu: [
			{ label: "Build", action: "build", accelerator: "CmdOrCtrl+B" },
			{ label: "Run", action: "run", accelerator: "CmdOrCtrl+R" },
			{ label: "Build And Run", action: "build-and-run", accelerator: "CmdOrCtrl+Shift+B" }
		]
	},
	{
		label: "Edit",
		submenu: [
			{ role: "undo" },
			{ role: "redo" },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			{ type: "separator" },
			{ role: "selectAll" }
		]
	},
	{
		label: "View",
		submenu: [
			{ label: "Zoom In", action: "zoom-in", accelerator: "CmdOrCtrl+=" },
			{ label: "Zoom Out", action: "zoom-out", accelerator: "CmdOrCtrl+-" },
			{ label: "Reset Zoom", action: "zoom-reset", accelerator: "CmdOrCtrl+0" }
		]
	},
	{
		label: "Debug",
		submenu: [
			{ label: "Open DevTools", accelerator: "CmdOrCtrl+Shift+I", click: () => window.webContents.openDevTools() }
		]
	}
], contextMenuTemplate = [
	{ role: "selectAll" },
	{ role: "cut" },
	{ role: "copy" },
	{ role: "paste" },
	{ type: "separator" },
	{ label: "Build", action: "build" },
	{ label: "Run", action: "run" },
	{ label: "Build And Run", action: "build-and-run" }
];
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
		backgroundColor: "#0b0b0b"
	});
	win.maximize();
	win.loadFile("index.html");
	win.webContents.on("did-finish-load", () => {
		win.show();
		const itemClick = x => win.webContents.send("menu-action", x.action);
		for (var subm of menuTemplate) {
			for (var item of subm.submenu) {
				if (item.action) {
					item.click = itemClick;
				}
			}
		}
		for (var item of contextMenuTemplate) {
			if (item.action) {
				item.click = itemClick;
			}
		}
		win.setMenu(Menu.buildFromTemplate(menuTemplate));
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
ipcMain.on("get-path", (event, name) => event.returnValue = app.getPath(name));
ipcMain.on("get-process-argv", event => event.returnValue = process.argv);
ipcMain.on("show-context-menu", event => {
	Menu.buildFromTemplate(contextMenuTemplate).popup(BrowserWindow.fromWebContents(event.sender));
})
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
