import React, { useEffect, useRef, useState } from 'react';
import data from '../unused.json';
import { Tree, Tooltip, Switch, Upload, Button } from 'antd';
import 'antd/dist/antd.css';
import Header from './components/header';

const App = () => {
    const [sourceData, setSourceData] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [mode, setMode] = useState('normal');
    const [currentFile, setCurrentFile] = useState();
    const [expendKeys, setExpendKeys] = useState([]);
    const [isExpandAll, setIsExpandAll] = useState(false);
    const allKeys = useRef([]);

    const turnTreeData = (list) => {
        let newList = JSON.parse(JSON.stringify(list)).map((item) => {
            if (item.type === 'file') {
                item.isLeaf = true;
            } else if (item.children) {
                allKeys.current.push(item.path);
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

        setTreeData(loop(JSON.parse(JSON.stringify(sourceData))));
    }

    const handleUpload = async (info) => {
        const text = await info.text();
        try{
            const json = JSON.parse(text);
            allKeys.current = [];
            setSourceData(turnTreeData(json));
            setCurrentFile(info);
        }catch(err) {
            alert(JSON.stringify(err));
        }

        return false;
    }

    useEffect(() => {
        if (mode === 'normal') {
            setTreeData(sourceData);
        } else {
            filterUnsed();
        }
        if (isExpandAll) {
            setExpendKeys(allKeys.current);
        }
    }, [sourceData, mode]);

    useEffect(() => {
        if (isExpandAll) {
            setExpendKeys(allKeys.current);
        } else {
            setExpendKeys([]);
        }
    }, [isExpandAll]);

    return <div style={{padding: 20}}>
        <Header />
        <div style={{margin: 20, display: 'flex', flexDirection: 'column', gap: 20}}>
            <div>
                <span>Filter unused：</span>
                <Switch checked={mode === 'filter' ? true: false} onChange={(checked) => {
                    if (checked) {
                        setMode('filter');
                    } else {
                        setMode('normal');
                    }
                }} />
            </div>
            <div>
                <span>Expand all：</span>
                <Switch checked={isExpandAll} onChange={setIsExpandAll} />
            </div>
            <div>
                Current file：
                <Upload 
                    showUploadList={false}
                    accept='.json' 
                    beforeUpload={handleUpload}>
                    {currentFile?.name} <Button>{currentFile?.name ? 'Change' : 'Upload'}</Button>
                </Upload>
            </div>
        </div>
        
        <hr/>
        {treeData?.length > 0 ? <Tree.DirectoryTree 
            fieldNames={{
                title: 'name',
                key: 'path',
            }} 
            defaultExpandAll
            expandedKeys={expendKeys}
            onExpand={(keys) => setExpendKeys(keys)}
            selectable={false}
            treeData={treeData}
            titleRender={(node) => {
                return <Tooltip title={node.path}>
                    <span style={node.used === false ? {color: '#f14848'}:{}}>{node.name}</span>
                </Tooltip>
            }} /> : <span>Click upload</span>}
    </div>
}

export default App;