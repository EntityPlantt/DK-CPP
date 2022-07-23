onload = () => {
    editor = window.ace.edit(document.getElementById("main"), {
        "selectionStyle": "line",
        "highlightActiveLine": true,
        "highlightSelectedWord": true,
        "readOnly": false,
        "copyWithEmptySelection": false,
        "cursorStyle": "ace",
        "mergeUndoDeltas": true,
        "behavioursEnabled": true,
        "wrapBehavioursEnabled": true,
        "enableAutoIndent": true,
        "keyboardHandler": "ace/keyboard/sublime",
        "showLineNumbers": true,
        "hScrollBarAlwaysVisible": false,
        "vScrollBarAlwaysVisible": false,
        "highlightGutterLine": true,
        "animatedScroll": false,
        "showInvisibles": "",
        "showPrintMargin": false,
        "fadeFoldWidgets": false,
        "showFoldWidgets": true,
        "displayIndentGuides": true,
        "showGutter": true,
        "fontSize": 13,
        "scrollPastEnd": 0,
        "theme": "ace/theme/one_dark",
        "maxPixelHeight": 0,
        "useTextareaForIME": true,
        "scrollSpeed": 2,
        "dragDelay": 0,
        "dragEnabled": true,
        "focusTimeout": 0,
        "tooltipFollowsMouse": true,
        "firstLineNumber": 1,
        "overwrite": false,
        "newLineMode": "auto",
        "useWorker": true,
        "useSoftTabs": true,
        "navigateWithinSoftTabs": false,
        "tabSize": 4,
        "wrap": "off",
        "indentedSoftWrap": true,
        "foldStyle": "markbegin",
        "mode": "ace/mode/c_cpp",
        "enableMultiselect": true,
        "enableBlockSelect": true,
        "hardWrap": false,
        "loadDroppedFile": true,
        "showTokenInfo": false,
        "enableEmmet": true,
        "enableBasicAutocompletion": true,
        "enableSnippets": true,
        "fontSize": "12pt"
    });
    onkeydown = event => {
        if (event.ctrlKey) {
            event.preventDefault();
            if (event.key.toLowerCase() == "s") {
                if (event.shiftKey) {
                    saveAsProject();
                }
                else {
                    saveProject();
                }
            }
            else if (event.key.toLowerCase() == "b") {
                if (event.shiftKey) {
                    buildAndRunProject();
                }
                else {
                    buildProject();
                }
            }
            else if (event.key.toLowerCase() == "r") {
                if (event.shiftKey) {
                    buildAndRunProject();
                }
                else {
                    runProject();
                }
            }
            else if (event.key.toLowerCase() == "o") {
                openProject();
            }
        }
    }
    sendOverBridge("editorValue", () => editor.getValue());
    sendOverBridge("setEditorValue", data => editor.session.setValue(data));
    sendOverBridge("setBuildLog", text => {
        document.getElementById("debug").innerHTML = text;
    });
    sendOverBridge("setBuildLogError", enabled => {
        if (enabled) {
            document.getElementById("debug").classList.add("error");
        }
        else {
            document.getElementById("debug").classList.remove("error");
        }
    });
    sendOverBridge("getBuildLog", () => document.getElementById("debug").innerHTML);
    loadCallback();
}