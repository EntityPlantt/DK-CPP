const { contextBridge, dialog, ipcRenderer } = require("electron");
const { writeFile, readFile } = require("original-fs");
const { exec } = require("child_process");
const { randomUUID } = require("crypto");
const { join } = require("path");

var filePath = __dirname, exposedVariables = new Object;
function saveProject() {
	writeFile(filePath, exposedVariables.editorValue(), { encoding: "ascii" }, async (err) => {
		if (err) {
			await saveAsProject();
		}
	});
	document.title = `(Saved) ${filePath} - DK-C++`;
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
	readFile(filePath, "ascii", (err, data) => {
		if (err) {
			window.alert("Error while opening\nMore info in console\n[CTRL + SHIFT + I]");
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
	exec("g++ --version", (error, stdout, stderr) => {
		if (error) {
			alert("G++ (an important dependency) is not installed.\nHead over to README.md for instructions.");
			exposedVariables.setBuildLog(stderr);
			exposedVariables.setBuildLogError(true);
		}
		else {
			exposedVariables.setBuildLog(stdout);
			exposedVariables.setBuildLogError(false);
        }
    });
}
function buildProject() {
	saveProject();
	return new Promise(ret => {
		exec(`g++ "${filePath}" -o "${filePath.substr(0, filePath.lastIndexOf("."))}.exe"`, (error, stdout, stderr) => {
			if (error) {
				exposedVariables.setBuildLog(stderr);
				exposedVariables.updateErrors(filePath);
			}
			else {
				exposedVariables.setBuildLog(`${stdout}\nProject successfully built file:
${filePath.substr(0, filePath.lastIndexOf(".")) + ".exe"}`);
				exposedVariables.clearErrors();
            }
			exposedVariables.setBuildLogError(Boolean(error));
			ret(!error);
		});
	});
}
function runProject() {
	writeFile(join(__dirname, "run.bat"), `call "${filePath.substr(0, filePath.lastIndexOf(".")) + ".exe"}"\npause\nexit`, err => {
		if (err) {
			exposedVariables.setBuildLog(err);
			exposedVariables.setBuildLogError(true);
		}
		else {
			exec(`start cmd /c "${join(__dirname, "run.bat")}"`, (error, stdout, stderr) => {
				if (error) {
					exposedVariables.setBuildLog(stderr);
					exposedVariables.setBuildLogError(true);
					if (confirm("It seems like you haven't built the app.\nDo you want to build it now?")) {
						buildAndRunProject();
					}
					else {
						exec(`del ${join(__dirname, "run.bat")}`, (error, stdout, stderr) => {
							if (error) {
								exposedVariables.setBuildLog(stderr);
								exposedVariables.setBuildLogError(true);
							}
							else {
								exposedVariables.setBuildLog(`Ran program:\n${filePath.substr(0, filePath.lastIndexOf("."))}.exe`);
								exposedVariables.setBuildLogError(false);
							}
						});
					}
				}
				else {
					exec(`del ${join(__dirname, "run.bat")}`, (error, stdout, stderr) => {
						if (error) {
							exposedVariables.setBuildLog(stderr);
							exposedVariables.setBuildLogError(true);
						}
						else {
							exposedVariables.setBuildLog(`Ran program:\n${filePath.substr(0, filePath.lastIndexOf("."))}.exe`);
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
contextBridge.exposeInMainWorld("saveProject", saveProject);
contextBridge.exposeInMainWorld("saveAsProject", saveAsProject);
contextBridge.exposeInMainWorld("loadProject", loadProject);
contextBridge.exposeInMainWorld("openProject", openProject);
contextBridge.exposeInMainWorld("buildProject", buildProject);
contextBridge.exposeInMainWorld("buildAndRunProject", buildAndRunProject);
contextBridge.exposeInMainWorld("runProject", runProject);
contextBridge.exposeInMainWorld("loadCallback", loadCallback);
contextBridge.exposeInMainWorld("sendOverBridge", (apiKey, api) => {
	exposedVariables[apiKey] = api;
});