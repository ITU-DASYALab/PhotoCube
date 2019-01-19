import React, { Component } from 'react';
import '../css/PhotoCubeClient.css';
import LeftDock from './LeftDock';
import ThreeBrowser from './ThreeBrowser';
import RightDock from './RightDock';

export const MyContext = React.createContext();

class MyProvider extends Component {
  state = {
    fileCount: 0,
    name: 'Wes',
    age: 100,
    cool: true
  }
  render() {
    return (
      <MyContext.Provider 
        value={{
          state: this.state,
          growAYearOlder: () => this.setState({
            age: this.state.age + 1
          }),
          updateFileCount: (count) => {
            this.setState({fileCount: count})
          }
        }}>
        {this.props.children}
      </MyContext.Provider>
    )
  }
}

class PhotoCubeClient extends Component {
  render() {
    return (
        <div className="App grid-container">
            <MyProvider>
                <LeftDock/>
                <ThreeBrowser/>
                <RightDock/>
            </MyProvider>
        </div>
    );
  }
}

export default PhotoCubeClient;