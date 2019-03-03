import React, { Component } from 'react';
import '../../css/RightDock.css';
import FileCount from './FileCount';
import BrowsingModeChanger, { BrowsingModes } from './BrowsingModeChanger';
import Dimensions from './Dimensions';
import Hierarchy from '../Middle/ThreeBrowser/Hierarchy';
import Tagset from '../Middle/ThreeBrowser/Tagset';
import HierarchyBrowser from './HierarchyBrowser';

class RightDock extends React.Component<{
        //Props contract:
        onDimensionChanged:(dimName: string, dimension:any) => void,
        onBrowsingModeChanged:(browsingmode: BrowsingModes) => void
        onClearAxis:(axisName: string) => void
    }>{

    private fileCount = React.createRef<FileCount>();
    private hierarchyBrowser = React.createRef<HierarchyBrowser>();

    constructor(props: any){
        super(props);
    }

    render(){
        return(
            <div id="RightDock">
                <FileCount ref={this.fileCount}/>
                <BrowsingModeChanger onBrowsingModeChanged={this.onBrowsingModeChanged} />
                <Dimensions onDimensionChanged={this.onDimensionChanged} onClearAxis={this.props.onClearAxis}/>
                <HierarchyBrowser ref={this.hierarchyBrowser} onDimensionChanged={this.onDimensionChanged}/>
            </div>
        );
    }

    UpdateFileCount(count: number){
        this.fileCount.current!.UpdateFileCount(count);
    }

    onDimensionChanged = (dimName: string, dimension:any) => {
        this.props.onDimensionChanged(dimName, dimension);
        if(dimension.type == "hierarchy"){
            if(this.hierarchyBrowser.current) this.hierarchyBrowser.current.RenderHierarchy(dimName, dimension);
        }else if(dimension.type == "tagset"){
            if(this.hierarchyBrowser.current) this.hierarchyBrowser.current.ClearHierarchy(dimName);
        }
        //ThreeBrowserController.getInstance().sayHello();
    }

    onBrowsingModeChanged = (selectedBrowsingMode: BrowsingModes) => {
        console.log(selectedBrowsingMode);
        this.props.onBrowsingModeChanged(selectedBrowsingMode);
    }

    onClearAxis = (axisName: string) => {
        if(this.hierarchyBrowser.current){ this.hierarchyBrowser.current.ClearHierarchy(axisName); }
        this.props.onClearAxis(axisName);
    }
}

export default RightDock;