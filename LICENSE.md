# License

You may use the **Tool** in any video, web page,
or as an image with [proper crediting](#crediting).
The **Tool** can be used for creating C++ sources,
headers and other C++ files.

Distribution is not allowed, in ANY way. If you want
to share the app, just send the link, not the executable.  
https://github.com/EntityPlantt/DK-CPP/releases

## Crediting

* If you upload one of the following things from this
  **Tool**, you should credit me [this way](#how-to-credit-media).
  - Images
  - Videos
* If you want to share code from this **Tool**, you
  should credit me [this way](#how-to-credit-code).
  - Code
* If you want to share code or media from this **Tool**
  that's not made by me, you should credit it like how
  it says.

### How to credit media

* In plain text:
  ```text
  An image/video from the DK-C++ project by EntityPlantt (https://github.com/EntityPlantt/DK-CPP)
  ```
* In Markdown:
  ```markdown
  An image/video from [the DK-C++ project](https://github.com/EntityPlantt/DK-CPP) by [EntityPlantt](https://github.com/EntityPlantt)
  ```
* In HTML:
  ```html
  <div class="attribution">An image/video from <a href="https://github.com/EntityPlantt/DK-CPP">the DK-C++ project</a> by <a href="https://github.com/EntityPlantt">EntityPlantt</a></div>
  ```

### How to credit code

Firstly, take out the snippet that you want to share.
```js
// ...
exec(`del ${join(__dirname, "run.bat")}`, (error, stdout, stderr) => {
	if (error) {
		exposedVariables.setBuildLog(stderr);
		exposedVariables.setBuildLogError(true);
	}
	else {
		exposedVariables.setBuildLog("Ran " + join(filePath, "..", "built.exe"));
		exposedVariables.setBuildLogError(false);
	}
});
// ...
```
Then, add a comment at the beginning.
```js
/**
 * Code from the DK-C++ project
 * https://github.com/EntityPlantt/DK-CPP
**/
exec(`del ${join(__dirname, "run.bat")}`, (error, stdout, stderr) => {
	if (error) {
		exposedVariables.setBuildLog(stderr);
		exposedVariables.setBuildLogError(true);
	}
	else {
		exposedVariables.setBuildLog("Ran " + join(filePath, "..", "built.exe"));
		exposedVariables.setBuildLogError(false);
	}
});
```