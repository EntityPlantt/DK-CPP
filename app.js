const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron"), path = require("path"), child_process = require("child_process");
const getMenuTemplate = (lang, webc) => {
	var l = require(path.join(__dirname, "lang", lang)), t = [
		{
			label: l["menu.file"],
			submenu: [
				{ label: l["menu.new"], action: "new", accelerator: "CmdOrCtrl+N" },
				{ type: "separator" },
				{ label: l["menu.open"], action: "open", accelerator: "CmdOrCtrl+O" },
				{ label: l["menu.save"], action: "save", accelerator: "CmdOrCtrl+S" },
				{ label: l["menu.saveas"], action: "save-as", accelerator: "CmdOrCtrl+Shift+S" },
				{ type: "separator" },
				{ label: l["menu.settings"], action: "settings", accelerator: "CmdOrCtrl+`" }
			]
		},
		{
			label: l["menu.project"],
			submenu: [
				{ label: l["menu.checkforerrors"], action: "check-for-errors", accelerator: "CmdOrCtrl+E" },
				{ label: l["menu.build"], action: "build", accelerator: "CmdOrCtrl+B" },
				{ label: l["menu.run"], action: "run", accelerator: "CmdOrCtrl+R" },
				{ label: l["menu.buildandrun"], action: "build-and-run", accelerator: "CmdOrCtrl+Shift+B" }
			]
		},
		{
			label: l["menu.edit"],
			submenu: [
				{ label: l["menu.undo"], role: "undo" },
				{ label: l["menu.redo"], role: "redo" },
				{ type: "separator" },
				{ label: l["menu.cut"], role: "cut" },
				{ label: l["menu.copy"], role: "copy" },
				{ label: l["menu.paste"], role: "paste" },
				{ type: "separator" },
				{ label: l["menu.selectall"], role: "selectAll" }
			]
		},
		{
			label: l["menu.view"],
			submenu: [
				{ label: l["menu.zoomin"], action: "zoom-in", accelerator: "CmdOrCtrl+=" },
				{ label: l["menu.zoomout"], action: "zoom-out", accelerator: "CmdOrCtrl+-" },
				{ label: l["menu.zoomreset"], action: "zoom-reset", accelerator: "CmdOrCtrl+0" }
			]
		},
		{
			label: l["menu.help"],
			submenu: [
				{ label: l["menu.about"], action: "about" },
				{ label: l["menu.bugreport"], action: "report-bug" }
			]
		},
		{
			label: l["menu.debug"],
			submenu: [
				{ label: l["menu.devtools"], accelerator: "CmdOrCtrl+Shift+I", click: () => window.webContents.openDevTools() },
				{ label: l["menu.reload"], action: "reload" }
			]
		}
	];
	const itemClick = x => webc.send("menu-action", x.action);
	for (var subm of t) {
		for (var item of subm.submenu) {
			if (item.action) {
				item.click = itemClick;
			}
		}
	}
	return t;
}, getContextMenuTemplate = (lang, refword, webc) => {
	var l = require(path.join(__dirname, "lang", lang)), t = [
		{ label: l["menu.selectall"], role: "selectAll" },
		{ label: l["menu.cut"], role: "cut" },
		{ label: l["menu.copy"], role: "copy" },
		{ label: l["menu.paste"], role: "paste" },
		{ type: "separator" },
		{ label: l["menu.build"], action: "build" },
		{ label: l["menu.run"], action: "run" },
		{ label: l["menu.buildandrun"], action: "build-and-run" },
		{ label: l["menu.checkforerrors"], action: "check-for-errors" }
	];
	if (refword) {
		t.push({ type: "separator" });
		t.push({ label: l["menu.reference"].replaceAll("%1", refword), click: x => createReferenceWindow(x.refword), refword });
	}
	const itemClick = x => webc.send("menu-action", x.action, ...x.param);
	for (var item of t) {
		if (item.action) {
			item.click = itemClick;
		}
	}
	return t;
}, getFileTypes = lang => {
	var l = require(path.join(__dirname, "lang", lang));
	return [
		{
			name: l["dialog.type.source"],
			extensions: ["cpp", "cxx", "c++"]
		},
		{
			name: l["dialog.type.header"],
			extensions: ["h", "hpp", "hxx", "h++"]
		},
		{
			name: l["dialog.type.any"],
			extensions: ["*"]
		}
	];
};
var window;
if (handleSquirrelEvent()) return;
function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		show: false,
		webPreferences: { preload: path.join(__dirname, "preload.js") },
		backgroundColor: "#0b0b0b"
	});
	win.maximize();
	win.loadFile("index.html");
	win.webContents.on("did-finish-load", () => {
		win.show();
	});
	return win;
}
function createReferenceWindow(query) {
	const win = new BrowserWindow({
		width: 1024,
		height: 576,
		backgroundColor: "#fff",
		webPreferences: { preload: path.join(__dirname, "reference.js") },
		title: query + " - cplusplus.com"
	});
	win.loadURL("https://cplusplus.com/" + query);
	win.setMenu(Menu.buildFromTemplate([]));
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
ipcMain.on("show-open-dialog", (event, filePath, lang) => {
	var l = require(path.join(__dirname, "lang", lang));
	var result = dialog.showOpenDialogSync(window, {
		defaultPath: filePath,
		title: l["dialog.title.open"],
		icon: "icon.ico",
		buttonLabel: l["dialog.button.open"],
		filters: getFileTypes(lang)
	});
	event.reply("collect-open-dialog", result ? result[0] : result);
});
ipcMain.on("show-save-dialog", (event, filePath, lang) => {
	var l = require(path.join(__dirname, "lang", lang));
	var result = dialog.showSaveDialogSync(window, {
		defaultPath: filePath,
		title: l["dialog.title.save"],
		icon: "icon.ico",
		buttonLabel: l["dialog.button.save"],
		filters: getFileTypes(lang)
	});
	event.reply("collect-save-dialog", result);
});
ipcMain.on("get-path", (event, name) => event.returnValue = app.getPath(name));
ipcMain.on("get-process-argv", event => event.returnValue = process.argv);
ipcMain.on("show-context-menu", (event, lang, refword) => {
	Menu.buildFromTemplate(getContextMenuTemplate(lang, refword, event.sender)).popup(BrowserWindow.fromWebContents(event.sender));
});
ipcMain.on("update-menu-bar", (event, lang) => {
	window.setMenu(Menu.buildFromTemplate(getMenuTemplate(lang, event.sender)));
});
function handleSquirrelEvent() {
	if (process.argv.length == 1) {
		return false;
	}
	const appFolder = path.resolve(process.execPath, '..');
	const rootAtomFolder = path.resolve(appFolder, '..');
	const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
	const exeName = path.basename(process.execPath);
	const spawn = (command, args) => {
		var spawnedProcess;
		try {
			spawnedProcess = child_process.spawn(command, args, { detached: true });
		} catch (error) { }
		return spawnedProcess;
	};
	const spawnUpdate = args => spawn(updateDotExe, args);
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
