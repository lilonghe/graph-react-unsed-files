
const path = require('path');
const dependencyTree = require('dependency-tree');
const fs = require('fs');
let basicPath, webpackPath, mainFilePath;

console.log('====');
console.log('Graph React unsed files generator');
console.log('Default ignore node_modules directory');
console.log('Visual link: https://www.lilonghe.net/graph-react-unsed-files/')
console.log('====\n');

process.argv.forEach((val) => {
    if (val.startsWith('-d=')) {
        let p = val.split('=')[1].trim();
        basicPath = path.resolve(p);
    } else if (val.startsWith('-w=')) {
        let webpack = val.split('=')[1].trim();
        webpackPath = path.resolve(webpack);
    } else if (val.startsWith('-m=')) {
        let m = val.split('=')[1].trim();
        mainFilePath = path.resolve(m);
    }
});

if (!basicPath) {
    console.log('-d= code directory, like `./src`');
    console.log('-w= webpack config, use by alias import,[optional], like `./build/webpack.base.js`');
    console.log('-m= main file[optional], like `./src/index.js`, default -d/index.js');
    console.log('Please input params');
    process.exit();
}

var tree = dependencyTree({
    filename: mainFilePath || path.join(basicPath,'/index.js'),
    directory: basicPath,
    webpackConfig: webpackPath,
    nodeModulesConfig: {
        entry: 'module'
    },
    filter: path => !path.includes('node_modules'),
});

let allFile = [];
function objectToList(obj) {
    let list = [];
    for (let key in obj) {
        let o = {
            key,
        };

        if (Object.keys(obj[key]).length > 0) {
            o.children = objectToList(obj[key]);
        }
        allFile.push(o.key);
        list.push(o);
    }
    return list;
}

function readAllFile(dir, parent) {
    let currentDir = (parent + '/' + dir).replaceAll('//', '/');
    let list = [];
    let files = fs.readdirSync(currentDir).filter(file => !file.startsWith('.'));
    if (dir.endsWith('node_modules')) {
        return list;
    }

    files.map(file => {
        let currentFile = (currentDir + '/' + file).replaceAll('//', '/');
        let item = {
            path: currentFile.replace(basicPath, ''),
        };
        let isFile = fs.statSync(currentFile).isFile();

        item.type = isFile ? 'file' : 'dir';
        item.name = file;

        if (!isFile) {
            item.children = readAllFile(file, currentDir);
            list.push(item)
        } else {
            if (allFile.find(item => item === currentFile)) {
                item.used = true;
            } else {
                item.used = false;
            }
            list.push(item)
        }
    })
    return list;
}

// file tree
objectToList(tree);
if (allFile.length === 0) {
    console.log(`Can't find file tree.`);
    process.exit();
}
// folder tree
let folderTree = readAllFile('', basicPath);

try{
    fs.writeFileSync('./unused.json', JSON.stringify(folderTree), { encoding: 'utf-8' });
    console.log('Generate success', './unused.json');
}catch(err) {
    console.log('Generate fail', err);
}