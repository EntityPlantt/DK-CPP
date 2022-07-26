var zoom;
onload = () => {
    zoom = parseInt(localStorage.getItem("app-settings-zoom")) || 1;
    updateZoom();
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
        "useWorker": false,
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
        "fontSize": "calc(12pt * var(--zoom))"
    });
    onkeydown = event => {
        if (event.ctrlKey) {
            const keys = ["s", "b", "r", "o", "w", "+", "-", "=", "0"];
            if (keys.includes(event.key)) {
                event.preventDefault();
            }
            switch (event.key.toLowerCase()) {
                case "s":
                    if (event.shiftKey) {
                        saveAsProject();
                    }
                    else {
                        saveProject();
                    }
                    break;
                case "b":
                    if (event.shiftKey) {
                        buildAndRunProject();
                    }
                    else {
                        buildProject();
                    }
                    break;
                case "r":
                    runProject();
                    break;
                case "o":
                    openProject();
                    break;
                case "+":
                case "=":
                    zoom *= 1.1;
                    updateZoom();
                    break;
                case "-":
                    zoom /= 1.1;
                    updateZoom();
                    break;
                case "0":
                    zoom = 1;
                    updateZoom();
                    break;
            }
        }
    }
    sendOverBridge("editorValue", () => editor.getValue());
    sendOverBridge("setEditorValue", data => editor.session.setValue(data));
    sendOverBridge("setBuildLog", text => {
        document.getElementById("debug").innerText = text;
    });
    sendOverBridge("setBuildLogError", enabled => {
        if (enabled) {
            document.getElementById("debug").classList.add("error");
        }
        else {
            document.getElementById("debug").classList.remove("error");
        }
    });
    sendOverBridge("getBuildLog", () => document.getElementById("debug").innerText);
    sendOverBridge("updateErrors", updateErrors);
    loadCallback();
}
function updateZoom() {
    document.body.style = `--zoom: ${zoom};`;
    blur();
    localStorage.setItem("app-settings-zoom", zoom);
    document.querySelectorAll("svg").forEach(elm => {
        elm.setAttribute("width", Math.floor(48 * zoom));
        elm.setAttribute("height", Math.floor(48 * zoom));
    });
}
function updateErrors(filePath) {
    var log = document.getElementById("debug").innerText, row, column, annotations = [], type, text;
    while (/\:\d+\:\d+/m.test(log)) {
        log = log.substr(log.search(/\:\d+\:\d+/m) + 1);
        row = column = 0;
        while (log[0] != ":") {
            row *= 10;
            row += parseInt(log[0]);
            log = log.substr(1);
        }
        log = log.substr(1);
        while (log[0] != ":") {
            column *= 10;
            column += parseInt(log[0]);
            log = log.substr(1);
        }
        log = log.substr(2);
        type = {
            error: "error",
            warning: "warning",
            note: "info"
        }[log.substr(0, log.indexOf(":"))];
        text = log.substr(0, log.indexOf("\n"));
        log = log.substr(log.indexOf("\n"));
        row--;
        if (row.toString() !== "NaN" && column.toString() !== "NaN") {
            annotations.push({row, column, type, text});
        }
    }
    editor.session.setAnnotations(annotations);
    document.getElementById("debug").innerHTML = document.getElementById("debug").innerHTML
        .replaceAll(/(.:.+?)(:\d+:\d+)/g, (match, p1, p2) =>
            (p1.lastIndexOf(filePath) == p1.length - filePath.length) ? `${p1}<a href='javascript:goTo("${p2}")'>${p2}</a>` : match
        );
}
function goTo(place) {
    place = place.split(":");
    editor.gotoLine(parseInt(place[1]), parseInt(place[2]), true);
    editor.focus();
}