const { contextBridge, ipcRenderer, shell } = require("electron"), { writeFile, readFile, writeFileSync, readdirSync } = require("fs"),
	{ exec } = require("child_process"), { join } = require("path");
var filePath = "", exposedVariables = new Object, zoom = 1, locale = new Object;
function saveProject() {
	if (!filePath.length) {
		saveAsProject();
		return;
	}
	writeFile(filePath, exposedVariables.editorValue(), { encoding: "utf-8" }, async (err) => {
		if (err) {
			await saveAsProject();
		}
		return err;
	});
	document.title = `${locale["ui.saved"]} ${filePath} - DK-C++`;
	var oldFilePath = filePath;
	setTimeout(() => {
		if (oldFilePath == filePath) {
			document.title = filePath + " - DK-C++";
		}
	}, 2500);
}
async function saveAsProject() {
	ipcRenderer.send("show-save-dialog", filePath);
	var result = await new Promise(ret =>
		ipcRenderer.on("collect-save-dialog", (event, path) =>
			ret(path)
		)
	);
	if (result) {
		filePath = result;
		saveProject();
	}
}
function loadProject() {
	readFile(filePath, "utf-8", (err, data) => {
		if (err) {
			window.alert(locale["message.open.error"]);
			window.console.error(err);
		}
		document.title = filePath + " - DK-C++";
		exposedVariables.setEditorValue(data);
	});
}
async function openProject() {
	ipcRenderer.send("show-open-dialog", filePath);
	var path = await new Promise(ret =>
		ipcRenderer.on("collect-open-dialog", (event, path) =>
			ret(path)
		)
	);
	if (path) {
		filePath = path;
		loadProject();
	}
}
function loadCallback() {
	readdirSync(join(__dirname, "lang")).forEach(f => {
		f = f.substring(0, f.length - 5);
		var opt = document.createElement("option");
		opt.value = f; opt.innerText = require(join(__dirname, "lang", f + ".json"))["language.name"];
		if ((localStorage.getItem("lang") || "en_us") == f) opt.setAttribute("selected", "");
		document.getElementById("lang").appendChild(opt);
	});
	exec("g++ --version", (error, stdout, stderr) => {
		if (error) {
			alert(locale["message.load.g++-error"]);
			exposedVariables.setBuildLog(stderr);
			exposedVariables.setBuildLogError(true);
		}
		else {
			exposedVariables.setBuildLog(stdout);
			exposedVariables.setBuildLogError(false);
		}
	});
	if (!localStorage.getItem("file-assoc-done")) {
		document.getElementById("file-assoc").style.display = "";
	}
	for (var arg of ipcRenderer.sendSync("get-process-argv").slice(1)) {
		if (/^[a-z]:[\\/][^?&*:|<>"]*$/gui.test(arg)) {
			filePath = arg;
			loadProject();
			break;
		}
	}
	oncontextmenu = event => {
		event.preventDefault();
		ipcRenderer.send("show-context-menu", localStorage.getItem("lang") || "en_us");
	};
	onclick = event => {
		if (event.target.parentElement.id == "autocomplete") {
			exposedVariables.autocomplete(event.target.innerText);
		}
		exposedVariables.autocompleteOptions([]);
	};
}
function buildProject() {
	saveProject();
	exposedVariables.setBuildLog(locale["log.build.start"].replaceAll("%1", filePath));
	exposedVariables.setBuildLogError(false);
	exposedVariables.updateErrors();
	return new Promise(ret => {
		exec(`g++ "${filePath}" -o "${filePath.substring(0, filePath.lastIndexOf("."))}.exe" -Wpedantic -Wall -Wextra`, (error, stdout, stderr) => {
			if (error) {
				exposedVariables.setBuildLog(stderr);
			}
			else {
				exposedVariables.setBuildLog(locale["log.build.success"].replaceAll("%1", filePath.substring(0, filePath.lastIndexOf(".")) + ".exe"));
			}
			exposedVariables.setBuildLogError(!!error);
			ret(!error);
			exposedVariables.updateErrors(filePath);
		});
	});
}
function runProject() {
	exposedVariables.setBuildLog(locale["log.run.start"].replaceAll("%1", filePath.substring(0, filePath.lastIndexOf(".")) + ".exe"));
	exposedVariables.setBuildLogError(false);
	exposedVariables.updateErrors();
	writeFile(join(__dirname, "run.bat"), `call "${filePath.substring(0, filePath.lastIndexOf(".")) + ".exe"}"\npause\nexit`, err => {
		if (err) {
			exposedVariables.setBuildLog(err);
			exposedVariables.setBuildLogError(true);
		}
		else {
			exec(`start cmd /c "${join(__dirname, "run.bat")}"`, (error, stdout, stderr) => {
				if (error) {
					exposedVariables.setBuildLog(stderr);
					exposedVariables.setBuildLogError(true);
					if (confirm(locale["message.run.confirm_build"])) {
						buildAndRunProject();
					}
					else {
						exec(`del "${join(__dirname, "run.bat")}"`, (error, stdout, stderr) => {
							if (error) {
								exposedVariables.setBuildLog(stderr);
								exposedVariables.setBuildLogError(true);
							}
							else {
								exposedVariables.setBuildLog(locale["log.run.success"].replaceAll("%1", filePath.substring(0, filePath.lastIndexOf(".")) + ".exe"));
								exposedVariables.setBuildLogError(false);
							}
						});
					}
				}
				else {
					exec(`del "${join(__dirname, "run.bat")}"`, (error, stdout, stderr) => {
						if (error) {
							exposedVariables.setBuildLog(stderr);
							exposedVariables.setBuildLogError(true);
						}
						else {
							exposedVariables.setBuildLog(locale["log.run.success"].replaceAll("%1", filePath.substring(0, filePath.lastIndexOf(".")) + ".exe"));
							exposedVariables.setBuildLogError(false);
						}
					});
				}
			});
		}
	});
}
async function buildAndRunProject() {
	if (await buildProject()) {
		runProject();
	}
}
async function assocFile(changeSettings = true, askLater = false) {
	if (changeSettings) {
		const exePath = ipcRenderer.sendSync("get-path", "exe");
		const cfiles = [], cheaders = [], ftypeCmd = [`ftype DK-CPP.CFile="${exePath}" "%1"`, `ftype DK-CPP.Header="${exePath}" "%1"`];
		if (document.getElementById("file-assoc-cpp").checked) cfiles.push("cpp");
		if (document.getElementById("file-assoc-cxx").checked) cfiles.push("cxx");
		if (document.getElementById("file-assoc-c++").checked) cfiles.push("c++");
		if (document.getElementById("file-assoc-h").checked) cheaders.push("h");
		if (document.getElementById("file-assoc-hpp").checked) cheaders.push("hpp");
		if (document.getElementById("file-assoc-hxx").checked) cheaders.push("hxx");
		if (document.getElementById("file-assoc-h++").checked) cheaders.push("h++");
		var cmd = cfiles.map(x => `assoc .${x}=DK-CPP.CFile`).concat(cheaders.map(x => `assoc .${x}=DK-CPP.Header`)).concat(ftypeCmd).join("\n");
		try {
			const batch = join(__dirname, "assoc.bat");
			writeFileSync(batch, cmd);
			exec(`start "" "${join(__dirname, "elevate.exe")}" -wait "${batch}"`, async (error, stdout, stderr) => {
				await exec("del " + join(__dirname, "assoc.bat"));
				exposedVariables.setBuildLog(locale["log.fassoc.success"]);
				exposedVariables.setBuildLogError(false);
			});
		}
		catch (err) {
			window.console.error(err);
			alert(locale["message.fassoc.error"]);
			exposedVariables.setBuildLog(err);
			exposedVariables.setBuildLogError(true);
			askLater = true;
		}
	}
	if (!askLater) {
		localStorage.setItem("file-assoc-done", true);
	}
	document.getElementById("file-assoc").style.display = "none";
}
function updateZoom() {
	document.body.style = `--zoom: ${zoom};`;
	window.blur();
	localStorage.setItem("app-settings-zoom", zoom);
	document.querySelectorAll("svg").forEach(elm => {
		elm.setAttribute("width", Math.floor(48 * zoom));
		elm.setAttribute("height", Math.floor(48 * zoom));
	});
}
function checkForErrors() {
	if (!filePath) return;
	saveProject();
	exec(`g++ "${filePath}" -fsyntax-only -Wpedantic -Wall -Wextra`, (err, stdout, stderr) => {
		if (stderr) {
			exposedVariables.setBuildLog(stderr);
		}
		else {
			exposedVariables.setBuildLog(locale["log.auto_check.ok"]);
		}
		exposedVariables.setBuildLogError(!!error);
		exposedVariables.updateErrors(filePath);
	});
}
function openSettings() {
	document.getElementById("settings").style.display = "";
	document.getElementById("settings-auto-check").checked = (localStorage.getItem("auto-check") || "false") == "true";
}
function closeSettings() {
	document.getElementById("settings").style.display = "none";
}
function localizeEditor() {
	locale = require(join(__dirname, "lang", localStorage.getItem("lang") || "en_us"));
	var text = document.body.innerHTML;
	text = text.replaceAll(/{{(.*?)}}/g, (str, key) => locale[key]);
	document.body.innerHTML = text;
	ipcRenderer.send("update-menu-bar", localStorage.getItem("lang") || "en_us");
}
function langChange(target) {
	localStorage.setItem("lang", target.value);
	ipcRenderer.send("update-menu-bar", target.value);
	location.reload();
}
ipcRenderer.on("menu-action", (_event, action) => {
	switch (action) {
		case "new": exec(`start "" "${ipcRenderer.sendSync("get-path", "exe")}"`); break;
		case "open": openProject(); break;
		case "save": saveProject(); break;
		case "save-as": saveAsProject(); break;
		case "check-for-errors": checkForErrors(); break;
		case "build": buildProject(); break;
		case "run": runProject(); break;
		case "build-and-run": buildAndRunProject(); break;
		case "zoom-in": zoom *= 1.1; updateZoom(); break;
		case "zoom-out": zoom /= 1.1; updateZoom(); break;
		case "zoom-reset": zoom = 1; updateZoom(); break;
		case "about": shell.openExternal("https://github.com/EntityPlantt/DK-CPP"); break;
		case "settings": openSettings(); break;
		case "report-bug": shell.openExternal("https://github.com/EntityPlantt/DK-CPP/issues/new?assignees=EntityPlantt&labels=bug&template=bug_report.md&title=%5BBug%5D"); break;
		case "reload": location.reload(); break;
	}
});
contextBridge.exposeInMainWorld("saveProject", saveProject);
contextBridge.exposeInMainWorld("saveAsProject", saveAsProject);
contextBridge.exposeInMainWorld("loadProject", loadProject);
contextBridge.exposeInMainWorld("openProject", openProject);
contextBridge.exposeInMainWorld("buildProject", buildProject);
contextBridge.exposeInMainWorld("buildAndRunProject", buildAndRunProject);
contextBridge.exposeInMainWorld("runProject", runProject);
contextBridge.exposeInMainWorld("loadCallback", loadCallback);
contextBridge.exposeInMainWorld("assocFile", assocFile);
contextBridge.exposeInMainWorld("setZoom", v => zoom = v);
contextBridge.exposeInMainWorld("updateZoom", updateZoom);
contextBridge.exposeInMainWorld("checkForErrors", checkForErrors);
contextBridge.exposeInMainWorld("closeSettings", closeSettings);
contextBridge.exposeInMainWorld("localizeEditor", localizeEditor);
contextBridge.exposeInMainWorld("langChange", langChange);
contextBridge.exposeInMainWorld("sendOverBridge", (apiKey, api) => {
	exposedVariables[apiKey] = api;
});