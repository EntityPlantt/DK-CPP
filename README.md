# DK-C++

DK-C++ is an IDE for beginners with simple commands:
**Build**, **Run** and **Build & Run**.

## Requirements
* Have a computer with Windows *(Recommended)*, Linux or MacOS.
* Install [G++](https://sourceforge.net/projects/mingw/)
  to compile the code.

## How to install
1. *(Strongly recommended, but optional)* Deactivate your antivirus.
1. Open `DK-C++.Setup.exe`.
1. If it closes and doesn't open DK-C++, do Step 2 again.
1. *(Recommended, but optional)* Activate your antivirus.

## How to compile it yourself
1. Have [Node.js](https://nodejs.org) and [NPM](https://npmjs.com) installed.
1. Download `Source code (zip)` from [the release](https://github.com/EntityPlantt/DK-CPP/releases).
1. Extract the folder.
1. Go with Command Prompt or PowerShell in the extracted folder.
1. Run the set below in the command prompt:
   ```batch
   npm i -D electron
   npm i -D electron-packager
   npm i -D electron-winstaller
   npm run package
   npm run installer
   ```
1. Your build is in `installer/Setup.exe`.