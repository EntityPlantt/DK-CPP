const { createWindowsInstaller } = require("./node_modules/electron-winstaller/lib/index");
const { join } = require("path");

(async () => {
	console.log("Creating installer...");
	try {
		await createWindowsInstaller({
			appDirectory: join(__dirname, "DK-C++-win32-x64"),
			outputDirectory: join(__dirname, "installer"),
			exe: "DK-C++.exe",
			iconUrl: join(__dirname, "icon.ico"),
			setupIcon: join(__dirname, "icon.ico"),
			setupExe: "DK-C++ Setup.exe",
			setupMsi: "DK-C++ Windows Setup.msi"
		});
		console.log("Created MSI installer");
	}
	catch (e) {
		console.error(e);
	}
})();