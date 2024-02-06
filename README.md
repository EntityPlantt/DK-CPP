# DK-C++

DK-C++ is an IDE for beginners with simple commands:
**Build**, **Run** and **Build & Run**.

## Translations needed

We need people to translate DK-C++ to their native (or secondary) languages.  
Please help with opening a pull request adding a JSON file in the `lang` directory,
with a filename `%ln%_%st%.json`, were `%ln%` is the language (in two letters) and
`%st%` is the state where this language is spoken.  
If the language is spoken in only one country,
set `%st%` to be the same as `%ln%`.

_For example, `mk_mk.json` is Macedonian, `en_us.json` is English spoken in United States,
and `en_uk.json` is English spoken in Britain._

Check `en_us.json` to see how to format the translation file, as well as the keys.
For the places that certain keys are used, check the code.  
_Maybe in the future there will be a tool to help translate DK-C++._

## Requirements

* Have a computer with Windows.
* Install G++ ([MinGW](https://sourceforge.net/projects/mingw/))
  to compile the code.

## How to install

1. _(Strongly recommended, but optional)_ Deactivate your antivirus.
2. Open `DK-C++.Setup.msi`.
3. Complete the installation.
4. _(Also strongly recommended, but again, optional)_ Activate your antivirus.

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
