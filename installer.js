(async () => {
    const { MSICreator } = require("electron-wix-msi"), { join } = require("path"), package = require(join(__dirname, "package.json"));
    console.log("0%   | Starting...");
    const msiCreator = new MSICreator({
        appDirectory: join(__dirname, "DK-C++-win32-x64"),
        outputDirectory: join(__dirname, "installer"),
        exe: "DK-C++",
        description: package.description,
        version: package.version,
        name: "DK-C++",
        icon: "icon.ico",
        manufacturer: package.author.name,
        shortName: package.name,
        upgradeCode: "1fb1dd48-5369-46f4-b18d-35c0ec62ab68",
        arch: "x64",
        features: { autoUpdate: true },
        ui: {
            enabled: true,
            chooseDirectory: true,
            images: { background: join(__dirname, "resources", "installer-background.jpg") }
        }
    });
    console.log("25%  | Created MSICreator");
    const wxs = await msiCreator.create();
    console.log("50%  | Created .wxs template file");
    await msiCreator.compile();
    console.log("100% | Done!");
})();