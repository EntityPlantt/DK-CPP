addEventListener("DOMContentLoaded", () => {
	localizeEditor();
	setZoom(parseInt(localStorage.getItem("app-settings-zoom")) || 1);
	updateZoom();
	editor = window.ace.edit(document.getElementById("main"), {
		selectionStyle: "line",
		highlightActiveLine: true,
		highlightSelectedWord: true,
		readOnly: false,
		copyWithEmptySelection: false,
		cursorStyle: "ace",
		mergeUndoDeltas: true,
		behavioursEnabled: true,
		wrapBehavioursEnabled: true,
		enableAutoIndent: true,
		keyboardHandler: "ace/keyboard/sublime",
		showLineNumbers: true,
		hScrollBarAlwaysVisible: false,
		vScrollBarAlwaysVisible: false,
		highlightGutterLine: true,
		animatedScroll: false,
		showInvisibles: "",
		showPrintMargin: false,
		fadeFoldWidgets: false,
		showFoldWidgets: true,
		displayIndentGuides: true,
		showGutter: true,
		fontSize: 13,
		scrollPastEnd: 0,
		theme: "ace/theme/one_dark",
		maxPixelHeight: 0,
		useTextareaForIME: true,
		scrollSpeed: 2,
		dragDelay: 0,
		dragEnabled: true,
		focusTimeout: 0,
		tooltipFollowsMouse: true,
		firstLineNumber: 1,
		overwrite: false,
		newLineMode: "auto",
		useWorker: false,
		useSoftTabs: true,
		navigateWithinSoftTabs: false,
		tabSize: 4,
		wrap: "off",
		indentedSoftWrap: true,
		foldStyle: "markbegin",
		mode: "ace/mode/c_cpp",
		enableMultiselect: true,
		enableBlockSelect: true,
		hardWrap: false,
		loadDroppedFile: true,
		showTokenInfo: false,
		enableEmmet: true,
		enableBasicAutocompletion: true,
		enableSnippets: true,
		fontSize: "calc(12pt * var(--zoom))"
	});
	sendOverBridge("editorValue", () => editor.getValue());
	sendOverBridge("setEditorValue", setEditorValue);
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
	sendOverBridge("getEditorChar", getEditorChar);
	sendOverBridge("getEditorWordRange", getEditorWordRange);
	sendOverBridge("getEditorWord", () => editor.session.getTextRange(getEditorWordRange()));
	sendOverBridge("getEditorCursor", () => editor.selection.getCursor());
	sendOverBridge("autocomplete", autocomplete);
	sendOverBridge("autocompleteOptions", autocompleteOptions);
	sendOverBridge("goTo", goTo);
	sendOverBridge("getSelectedText", () => editor.getSelectedText());
	var editorCursor, lastInput;
	document.getElementById("main").addEventListener("keyup", event => {
		editorChange(editor.getValue());
		if (localStorage.getItem("auto-check") == "true") {
			lastInput = Date.now();
			setTimeout(() => {
				if (lastInput + 5000 <= Date.now()) {
					checkForErrors();
				}
			}, 5000);
		}
		if (/^(\w|Backspace|Arrow(Up|Down)|Tab|\t|Shift)$/.test(event.key) && !(event.ctrlKey || event.altKey || event.metaKey)) {
			if (/^(\w|Backspace|Shift)$/.test(event.key)) {
				const word = editor.session.getTextRange(getEditorWordRange());
				if (word.length) {
					var autocomp = editor.getValue().split(/\b/);
					autocomp = [...new Set(autocomp.filter(x => /^\w+$/.test(x)))].sort();
					autocompleteOptions(autocomp.filter(x => new RegExp(word, "i").test(x) && x != word));
				}
			}
		}
		else {
			autocompleteOptions([]);
		}
		if (["ArrowUp", "ArrowDown", "Tab", "\t"].includes(event.key) && document.getElementById("autocomplete").innerHTML
			&& !(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)) {
			goTo(editorCursor.row + ":" + editorCursor.column);
			const elm = document.querySelector("#autocomplete > li.selected");
			if (event.key == "ArrowUp") {
				if (elm.previousElementSibling) {
					elm.previousElementSibling.classList.add("selected");
					elm.previousElementSibling.scrollIntoView();
					elm.classList.remove("selected");
				}
			}
			else if (event.key == "ArrowDown") {
				if (elm.nextElementSibling) {
					elm.nextElementSibling.classList.add("selected");
					elm.nextElementSibling.scrollIntoView();
					elm.classList.remove("selected");
				}
			}
			else {
				editor.undo();
				autocomplete();
				autocompleteOptions([]);
			}
		}
		editorCursor = editor.selection.getCursor();
	});
	loadCallback();
});
function updateErrors(filePath) {
	if (!filePath) {
		editor.session.setAnnotations([]);
		return;
	}
	var log = document.getElementById("debug").innerText, row, column, annotations = [], type, text;
	while (/\:\d+\:\d+/m.test(log)) {
		log = log.substring(log.search(/\:\d+\:\d+/m) + 1);
		row = column = 0;
		while (log[0] != ":") {
			row *= 10;
			row += parseInt(log[0]);
			log = log.substring(1);
		}
		log = log.substring(1);
		while (log[0] != ":") {
			column *= 10;
			column += parseInt(log[0]);
			log = log.substring(1);
		}
		log = log.substring(2);
		type = {
			"fatal error": "error",
			error: "error",
			warning: "warning",
			note: "info"
		}[log.substring(0, log.indexOf(":"))];
		text = log.substring(0, log.indexOf("\n"));
		log = log.substring(log.indexOf("\n"));
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
	editor.gotoLine(parseInt(place[0]) + 1, parseInt(place[1]), true);
	editor.focus();
}
function getEditorWordRange() {
	const cursor = editor.selection.getCursor(), before = Object.assign({}, cursor);
	while (/\w/.test(editor.session.getTextRange(new ace.Range(before.row, before.column - 1, before.row, before.column)))) before.column--;
	return new ace.Range(before.row, before.column, cursor.row, cursor.column);
}
function setEditorValue(data, keepHistory) {
	if (keepHistory) editor.setValue(data);
	else editor.session.setValue(data);
}
function autocomplete(text) {
	if (!text) text = document.querySelector("#autocomplete > li.selected").innerText;
	var wrange = getEditorWordRange();
	if (editor.session.getTextRange(wrange) == text.substring(0, wrange.end.column - wrange.start.column)) {
		editor.insert(text.substring(wrange.end.column - wrange.start.column));
	}
	else {
		editor.session.replace(wrange, text);
	}
}
function autocompleteOptions(arr) {
	document.getElementById("autocomplete").innerHTML = arr.map(x => `<li>${x}</li>`).join("");
	if (arr.length)
		document.querySelector("#autocomplete > li").classList.add("selected");
}
function getEditorChar(posRelativeToCursor = 0) {
	const c = editor.selection.getCursor();
	c.column += posRelativeToCursor;
	return editor.session.getTextRange(new ace.Range(c.row, c.column - 1, c.row, c.column));
}