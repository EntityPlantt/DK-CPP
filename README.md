# DK-C++

DK-C++ is an IDE for beginners with simple commands:
**Build**, **Run** and **Build & Run**.

## Requirements
* Have a computer with Windows.
* Install G++ ([MinGW](https://sourceforge.net/projects/mingw/))
  to compile the code.

## How to install
1. *(Strongly recommended, but optional)* Deactivate your antivirus.
2. Open `DK-C++.Setup.msi`.
3. Complete the installation.
4. *(Also strongly recommended, but again, optional)* Activate your antivirus.

## How to compile it yourself
**NOTE**: This is only for Windows. I don't plan building this app to exist on Linux/Mac.
1. Have [Node.js](https://nodejs.org) and [NPM](https://npmjs.com) installed.
2. Download `Source code (zip)` from [the release](https://github.com/EntityPlantt/DK-CPP/releases).
3. Extract the folder.
4. Go with Command Prompt or PowerShell in the extracted folder.
5. Run the set below in the command prompt:
   ```batch
   npm i -D
   npm run build
   ```
6. Your build is in the `installer` folder.