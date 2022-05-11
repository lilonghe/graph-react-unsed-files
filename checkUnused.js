
const path = require('path');
const dependencyTree = require('dependency-tree');
const basicPath = path.resolve(__dirname, './src');
const fs = require('fs');

var tree = dependencyTree({
    filename: './src/index.js',
    directory: './src',
    webpackConfig: './build/webpack.base',
    nodeModulesConfig: {
        entry: 'module'
    },
  filter: path => path.indexOf('node_modules') === -1,
});

let allFile = [];
function objectToList(obj) {
    let list = [];
    for (let key in obj) {
        let o = {
            key: key.replace(basicPath, ''),
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
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            if (allFile.find(item => basicPath + item === currentFile)) {
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
let newTree = objectToList(tree);

// folder tree
let folderTree = readAllFile('', basicPath);

// console.log(JSON.stringify(newTree))
// console.log(JSON.stringify(folderTree))

fs.writeFileSync('./unused.json', JSON.stringify(folderTree), { encoding: 'utf-8' })