const fs = require('fs');
const replaceFile = require('replace-in-file');
const package = require("./package.json");
const angular = require("./angular.json");
const buildVersion = package.version;
let buildPath = '\\';
const defaultProject = angular.defaultProject;
const appendUrl = '?v=' + buildVersion;
const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
}
const relativePath = getNestedObject(angular, ['projects', defaultProject, 'architect', 'build', 'options', 'outputPath']); // to identify relative build path when angular make build
buildPath += relativePath.replace(/[/]/g, '\\');
var indexPath = __dirname + buildPath + '/' + 'index.html';
fs.readdir(__dirname + buildPath, (err, files) => {
    if (err) {
        console.log('__err:', err);
    }

    files.forEach(file => {
        if (file.match(/^(es2015-polyfills|main|polyfills|runtime|scripts|styles)+(.)+([a-z0–9.\-])*(js|css)$/g)) { // regex is identified by build files generated
            console.log('Current Filename: ', file);
            const currentPath = file;
            const changePath = file + appendUrl;
            changeIndex(currentPath, changePath);
        }
    });
});
function changeIndex(currentfilename, changedfilename) {
    const options = {
        files: indexPath,
        from: '"' + currentfilename + '"',
        to: '"' + changedfilename + '"',
        allowEmptyPaths: false,
    };
    try {
        let changedFiles = replaceFile.sync(options);
        if (changedFiles == 0) {
            console.log("File updated failed");
        } else if (changedFiles[0].hasChanged === false) {
            console.log("File already updated");
        }
        console.log('Changed Filename: ', changedfilename);
    } catch (error) {
        console.error('Error occurred: ', error);
        throw error
    }
}
