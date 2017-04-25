function calculateHash(fileContents) {
    return sha1.hash(fileContents);
}

function startProcessing(fileInput, onsuccess, onerror, onprogress) {
    var fileList = fileInput[0].files;
    var file = fileList[0];
    var results = {
        name: file.name,
        size: file.size,
        type: file.type,
        hash: ""
    };

    var fileReader = new FileReader();
    fileReader.onload = function (e) {
        results.hash = calculateHash(e.target.result);
        onsuccess(results);
    };
    fileReader.onerror = function (e) {
        onerror(e.target.error.name);
    };
    fileReader.onprogress = function (e) {
        onprogress(e.loaded, e.total);
    };
    fileReader.readAsArrayBuffer(file);
}

function setResults(name, size, type, hash) {
    var table = $("#processResults");
    table.find("#nameValue").text(name);
    table.find("#sizeValue").text(size);
    table.find("#typeValue").text(type);
    table.find("#hashValue").text(hash);
}

function clearResults() {
    $("#processProgress").val(0).show();
    $("#processError").hide();
    $("#processResults").hide();
    setResults("", "", "", "");
}

function populateResults(data) {
    $("#processProgress").val(1);
    $("#processResults").show();
    setResults(data.name, data.size, data.type, data.hash);
}

function populateError(msg) {
    $("#processProgress").hide();
    $("#processError").text("Failed to read file: " + msg);
    $("#processError").show();
}

function populateProgress(loaded, total) {
    $("#processProgress").val(loaded / total);
}

function initialize() {
    $("#fileForm").submit(function (e) {
        e.preventDefault();
        clearResults();
        startProcessing($("#fileInput"), populateResults, populateError, populateProgress);
    });
    clearResults();
}

$(document).ready(initialize);