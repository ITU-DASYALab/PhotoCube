import React, { Component } from 'react';
import '../../css/BrowsingState.css'

class BrowsingStateLoader extends Component{
    render() {
        return (
            <div id="BrowsingState">
                <h4 className="MenuHeader">Browsing state</h4>
                <button className="MenuButton">New browsing state</button>
                <button className="MenuButton">Save browsing state</button>
                <button className="MenuButton">Load browsing state</button>
            </div>		
        );
    }
}

export default BrowsingStateLoader;