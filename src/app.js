import React, { useEffect } from 'react';
import data from '../unused.json';
import { Tree, Tooltip, Switch } from 'antd';
import 'antd/dist/antd.css';
import Header from './components/header';

const App = () => {
    const [treeData, setTreeData] = React.useState([]);

    const turnTreeData = (list) => {
        let newList = JSON.parse(JSON.stringify(list)).map((item) => {
            if (item.type === 'file') {
                item.isLeaf = true;
            } else if (item.children) {
                item.children = turnTreeData(item.children);
            }
            return item;
        });
        return newList;
    }

    const filterUnsed = () => {
        function loop(list) {
            let newList = [];
            list.map((item) => {
                if (item.type === 'file') {
                    if (!item.used) {
                        newList.push(item);
                    }
                } else if (item.type === 'dir') {
                    item.children = loop(item.children);
                    if (item.children?.length > 0) {
                        newList.push(item);
                    }
                }
            });
            return newList;
        }

        setTreeData(loop(turnTreeData(treeData)));
    }

    useEffect(() => {
        setTreeData(turnTreeData(data));
    }, []);

    return <div style={{padding: 20, border: '1px solid #CCC'}}>
        <Header />
        <div style={{margin: 20, display: 'flex'}}>
            <span>Filter unused：</span>
            <Switch onChange={(checked) => {
                if (checked) {
                    filterUnsed();
                } else {
                    setTreeData(turnTreeData(data));
                }
            }} />
        </div>
        <hr/>
        <Tree.DirectoryTree 
            fieldNames={{
                title: 'name',
                key: 'path',
            }} 
            defaultExpandAll
            selectable={false}
            treeData={treeData}
            titleRender={(node) => {
                return <Tooltip title={node.path}>
                    <span style={node.used === false ? {color: '#f14848'}:{}}>{node.name}</span>
                </Tooltip>
            }} />
    </div>
}

export default App;