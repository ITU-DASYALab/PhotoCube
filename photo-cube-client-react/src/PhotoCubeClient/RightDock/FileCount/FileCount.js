import React, { Component } from 'react';
import './FileCount.css';

/**
 * FileCount is a Component that shows how many objects the ThreeBrowser is currently showing.
 */
class FileCount extends Component{
    
    render(){
        return(
            <div id="FileCount">
                <h4 className="Header">File count</h4>
                <div className="Content">
                    <p>Showing: </p>
                    <p id="fileCountValue">{this.state.fileCount}</p>
                    <p> objects</p>
                    <button onClick={() => this.setState({fileCount: this.state.fileCount + 1}) }>Click</button>
                </div>
            </div>
        );
    }

    constructor(props) {
        super(props);
        this.state = {
            fileCount: 0,
        };
    }

    updateFileCount(count){
        this.setState({fileCount: count});
    }
}

export default FileCount;