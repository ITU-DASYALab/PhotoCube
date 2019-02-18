import * as React from 'react';
import * as THREE from 'three';
import Position from './Position';
import '../../../css/ThreeBrowser.css';
import stockImage from '../../../images/download.jpg';
import helveticaRegular from '../../../fonts/helvetiker_regular.typeface.json';
import Axis, {AxisTypeEnum, AxisDirection, ObjectTagPair} from './Axis';
import Cell from './Cell';
import Fetcher from './Fetcher';
import Tag from './Tag';
import Hierarchy from './Hierarchy';
import Tagset from './Tagset';

const OrbitControls = require('three-orbitcontrols')

/*
 TODO: 
- Add own Threejs code (Done except for key presses)
- Continue with tutorial: https://reactjs.org/tutorial/tutorial.html#completing-the-game
*/

/**
 * The ThreeBrowser Component is the browsing component used to browse photos in 3D.
 * The ThreeBrowser uses the three.js library for 3D rendering: https://threejs.org/
 */
class ThreeBrowser extends React.Component<{onFileCountChanged: (fileCount: number) => void}>{
    state: React.ComponentState = {
        //The three axis:
        xAxis: null,
        yAxis: null,
        zAxis: null,

        //Cube data:
        cubeObjects: [],

        //Cells:
        cells: []
    }

    mount: HTMLDivElement|null = this.mount!;
    //ADD SCENE
    scene: THREE.Scene = new THREE.Scene();
    camera: any;
    renderer: any;
    controls: any;
    textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
    textMeshes: any = [];
    textLoader: any;
    font:any;
    frameId: any;
    distinctPhotoObjects: Object = new Object();
    
    Colors = {
        red: 0xF00000,
        green: 0x00F000,
        blue: 0x0000F0
    }

    constructor(props: any){
        super(props);
        
    }
    
    componentDidMount(){
        //Get temporary width and height
        let width = this.mount!.clientWidth
        let height = this.mount!.clientHeight

        //ADD CAMERA
        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        this.camera.position.x = 5;
        this.camera.position.y = 5;
        this.camera.position.z = 5;
        
        //ADD RENDERER
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        //this.renderer.setClearColor('#000000') //Black clear color, default white.
        this.renderer.setSize(width, height)
        this.mount!.appendChild(this.renderer.domElement)
        
        //SET CONTROLS TO ORBITCONTROL
        this.controls = new OrbitControls( this.camera, this.renderer.domElement);

        //START ANIMATION
        this.start()

        //CREATE TEXTLOADERS:
        this.textLoader = new THREE.FontLoader();
        this.font = this.textLoader.parse(helveticaRegular);

        //Filling out available space:
        this.resizeBrowser();
        window.addEventListener("resize", this.resizeBrowser);

        //XYZ-AXIS:
        //Creating X-Axis:
        let newXAxis = new Axis(AxisDirection.x, "X", AxisTypeEnum.Tagset);
        newXAxis.TitleThreeObject = this.addText("X", {x:5,y:0,z:0}, new THREE.Color(0xF00000), 0.5);
        newXAxis.LineThreeObject = this.addLine({x:0,y:0,z:0}, {x:5,y:0,z:0}, new THREE.Color(0xF00000));
        this.setState( {xAxis: newXAxis} );
        //Creating Y-Axis:
        let newYAxis = new Axis(AxisDirection.y, "Y", AxisTypeEnum.Tagset);  
        newYAxis.TitleThreeObject = this.addText("Y", {x:0,y:5,z:0}, new THREE.Color(0x00F000), 0.5);
        newYAxis.LineThreeObject = this.addLine({x:0,y:0,z:0}, {x:0,y:5,z:0}, new THREE.Color(0x00F000));
        this.setState( {yAxis: newYAxis} );
        //Creating Z-Axis:
        let newZAxis = new Axis(AxisDirection.z, "Z", AxisTypeEnum.Tagset);
        newZAxis.TitleThreeObject = this.addText("Z", {x:0,y:0,z:5}, new THREE.Color(0x0000F0), 0.5);
        newZAxis.LineThreeObject = this.addLine({x:0,y:0,z:0}, {x:0,y:0,z:5}, new THREE.Color(0x0000F0));
        this.setState( {zAxis: newZAxis} );

        //Add keydown handler:
        document.addEventListener('keydown', this.handleKeyPress);

        THREE.DefaultLoadingManager.onProgress = (item:any, loaded: number, total: number) => {
            console.log(item);
            console.log((loaded / total * 100));
        };

        //this.addCube(stockImage, { x:1, y:1, z:1 } );
        //this.addCube("https://localhost:44317/api/thumbnail/1", { x:1, y:1, z:1 } );

        /*
        let cell = new Cell(this.scene, this.textLoader, {x:0, y:0, z:0}, [{
            Id: 42,
            FileType: 42,
            PhotoId: 5,
            Photo: null,
            ObjectTagRelations: null,
            ThumbnailId: 1,
            Thumbnail: 1
        }]);
        */
    }

    componentWillUnmount(){
        this.stop()
        this.mount!.removeChild(this.renderer.domElement)
        this.unsubscribeToDocumentEvents();
    }

    unsubscribeToDocumentEvents(){
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener("resize", this.resizeBrowser);
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }
        
    stop = () => {
        cancelAnimationFrame(this.frameId)
    }
        
    animate = () => {
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
        //Point text to camera:
        this.textMeshes.forEach((t:THREE.Mesh) => t.lookAt( this.camera.position ) );
    }

    //TODO: Add progressbar
    render(){
        return(
            <div className="grid-item" id="ThreeBrowser">
                <div style={{ width: '400px', height: '400px' }} ref = {(mount) => { this.mount = mount }}/>
            </div>
        );
    }
        
    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    }

    resizeBrowser = () => {
        let browserElement: HTMLElement = document.getElementById('ThreeBrowser')!;
        let width = browserElement.clientWidth;
        let height = browserElement.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    handleKeyPress = (event: KeyboardEvent) => {
        if(event.code === "Space"){
            //Move camera up in the y direction:
            this.camera.position.y += 0.1;
            this.controls.target.y += 0.1;
            this.controls.update();
        }
        else if(event.code === "ControlLeft"){
            //Move camera down in the y direction:
            this.camera.position.y -= 0.1;
            this.controls.target.y -= 0.1;
            this.controls.update();
        }
    }

    /* Add cubes to scene with given imageURL and a position */
    addCube(imageUrl: string, aPosition: Position) {
        //Load image as material:
        let imageMaterial = new THREE.MeshBasicMaterial({
            map : this.textureLoader.load(imageUrl)
        });
        //Make box geometry:
        let boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
        //Create mesh:
        let boxMesh = new THREE.Mesh( boxGeometry, imageMaterial );
        //Position in (x,y,z):
        boxMesh.position.x = aPosition.x;
        boxMesh.position.y = aPosition.y;
        boxMesh.position.z = aPosition.z;
        //Add to scene:
        this.scene.add( boxMesh );
        return boxMesh;
    }

    /* Add a line from THREE.Vector3(x,y,z) to THREE.Vector3(x,y,z) with a given color */
    addLine(fromPosition: Position, toPosition: Position, aColor:THREE.Color) {
        let lineMaterial = new THREE.LineBasicMaterial( { color: aColor } );
        let lineGeometry = new THREE.Geometry();
        let from = new THREE.Vector3(fromPosition.x,fromPosition.y,fromPosition.z);
        let to = new THREE.Vector3(toPosition.x, toPosition.y, toPosition.z);
        lineGeometry.vertices.push( from );
        lineGeometry.vertices.push( to );
        let lineMesh = new THREE.Line( lineGeometry, lineMaterial );
        this.scene.add( lineMesh );
        return lineMesh;
    }

    /* Add some text with a color located on x, y, z */
    addText(someText: string, aPosition:Position, aColor:THREE.Color, aSize:number){
        let textGeometry = new THREE.TextGeometry( someText, {
            font: this.font,
            size: aSize,
            height: 0.1,
            curveSegments: 20
        } );
        let textMaterial = new THREE.MeshBasicMaterial( { color: aColor } );
        let textMesh = new THREE.Mesh( textGeometry, textMaterial );
        textMesh.position.x = aPosition.x;
        textMesh.position.y = aPosition.y;
        textMesh.position.z = aPosition.z;
        this.textMeshes.push(textMesh);
        this.scene.add( textMesh );
        return textMesh; //Returns ThreeObject
    }
        
    /**
     * Updates axis labels and then calls compute cells.
     * @param dimName "X", "Y" or "Z"
     * @param dimension 
     */
    async updateAxis(dimName:string, dimension:any){
        //Fetch hierarchy or tagset:
        let axisData: any;
        await fetch("https://localhost:44317/api/" + dimension.type + "/" + dimension.id)
        .then(result => {return result.json();})
        .then(tagsetOrHierarchy => {
            if(dimension.type === "hierarchy"){
                let hierarchy: Hierarchy = tagsetOrHierarchy as Hierarchy;
                let tags: Tag[] = hierarchy.Nodes.map( n => n.Tag!);
                axisData = { Tags: tags, Name: hierarchy.Name + " (hierarchy)" };
            }else{
                tagsetOrHierarchy.Name = tagsetOrHierarchy.Name + " (tagset)";
                axisData = tagsetOrHierarchy;
            }
        });

        //Sort tags alphabethically:
        axisData.Tags.sort((a:Tag,b:Tag) => a.Name > b.Name ? 1 : a.Name < b.Name ? -1 : 0);

        //Update axis:
        const offsetFromCenter = 1;
        switch(dimName){
            case "X":
                //Fetch old state:
                let newXAxis: Axis = this.state.xAxis;

                //Remove objects from scene:
                newXAxis.RemoveObjectsFromScene(this.scene);

                //Add new labels to scene and state:
                let newXLabelObjectsAndTags = [];
                for(let i = 0; i < axisData.Tags.length; i++){
                    newXLabelObjectsAndTags.push({ 
                        object: this.addText(
                            axisData.Tags[i].Name, 
                            {x:i + offsetFromCenter,y:0,z:0}, 
                            new THREE.Color(this.Colors.red),
                            0.1),
                        tag: axisData.Tags[i] 
                    });
                }
                
                //Update values:
                newXAxis.LabelThreeObjectsAndTags = newXLabelObjectsAndTags;
                newXAxis.SetAxisType(AxisTypeEnum.Tagset);
                newXAxis.TitleString = axisData.Name;
                
                //Add objects to scene and values:
                newXAxis.TitleThreeObject = this.addText(
                    axisData.Name,
                    {x:axisData.Tags.length + offsetFromCenter,y:0,z:0},
                    new THREE.Color(this.Colors.red),
                    0.5
                );
                newXAxis.LineThreeObject = this.addLine(
                    {x:0,y:0,z:0}, 
                    {x:newXAxis.LabelThreeObjectsAndTags.length,y:0,z:0}, 
                    new THREE.Color(this.Colors.red)
                );
                
                //Update xAxis in state:
                this.setState( {xAxis: newXAxis} );
            break;
            case "Y":
                //Fetch old state:
                let newYAxis: Axis = this.state.yAxis;

                //Remove objects from scene:
                newYAxis.RemoveObjectsFromScene(this.scene);

                //Add new labels to scene and state:
                let newYLabelObjectsAndTags = [];
                for(let i = 0; i < axisData.Tags.length; i++){
                    newYLabelObjectsAndTags.push({ 
                        object: this.addText(
                            axisData.Tags[i].Name,
                            {x:0,y:i + offsetFromCenter,z:0},
                            new THREE.Color(this.Colors.green),
                            0.1
                        ),
                        tag: axisData.Tags[i] 
                    });
                }
                
                //Update values:
                newYAxis.LabelThreeObjectsAndTags = newYLabelObjectsAndTags;
                newYAxis.SetAxisType(AxisTypeEnum.Tagset);
                newYAxis.TitleString = axisData.Name;
                
                //Add objects to scene and values:
                newYAxis.TitleThreeObject = this.addText(axisData.Name, {x:0,y:axisData.Tags.length + offsetFromCenter,z:0}, new THREE.Color(this.Colors.green), 0.5);
                newYAxis.LineThreeObject = this.addLine({x:0,y:0,z:0}, {x:0,y:newYAxis.LabelThreeObjectsAndTags.length,z:0}, new THREE.Color(this.Colors.green));
                
                //Update yAxis in state:
                this.setState( {yAxis: newYAxis} );
            break;
            case "Z":
                //Fetch old state:
                let newZAxis: Axis = this.state.zAxis;

                //Remove objects from scene:
                newZAxis.RemoveObjectsFromScene(this.scene);

                //Add new labels to scene and state:
                let newZLabelObjectsAndTags = [];
                for(let i = 0; i < axisData.Tags.length; i++){
                    newZLabelObjectsAndTags.push({ 
                        object: this.addText(axisData.Tags[i].Name, {x:0,y:0,z:i + offsetFromCenter}, new THREE.Color(this.Colors.blue), 0.1),
                        tag: axisData.Tags[i] 
                    });
                }
                
                //Update values:
                newZAxis.LabelThreeObjectsAndTags = newZLabelObjectsAndTags;
                newZAxis.SetAxisType(AxisTypeEnum.Tagset);
                newZAxis.TitleString = axisData.Name;
                
                //Add objects to scene and values:
                newZAxis.TitleThreeObject = this.addText(axisData.Name, {x:0,y:0,z:axisData.Tags.length + offsetFromCenter}, new THREE.Color(this.Colors.blue), 0.5);
                newZAxis.LineThreeObject = this.addLine({x:0,y:0,z:0}, {x:0,y:0,z:newZAxis.LabelThreeObjectsAndTags.length}, new THREE.Color(this.Colors.blue));
                
                //Update zAxis in state:
                this.setState( {zAxis: newZAxis} );
            break;
        }

        this.computeCells();
    }

    async fetchAndAddCubeObjectsForOneAxis(axis: Axis){
        let cells: Cell[] = [];
        let promises = axis.LabelThreeObjectsAndTags.map(async (otp: ObjectTagPair, index) => {
            let cubeObjectArr = await Fetcher.FetchCubeObjectsWithTagsOTR(otp.tag, null, null);
            let coordinate = {x:0, y:0, z:0};
            switch(axis.AxisDirection){
                case AxisDirection.x: //If axis is xAxis
                    coordinate.x += 1 + index;
                    coordinate.y += 1;
                    break;
                case AxisDirection.y:
                    coordinate.y += 1 + index;
                    coordinate.z += 0.5;
                    break;
                case AxisDirection.z:
                    coordinate.z += 1 + index;
                    coordinate.y += 1;
                    break;
            }

            let cell = new Cell(this.scene, this.textLoader, coordinate, cubeObjectArr);
            cells.push(cell);
        })
        await Promise.all(promises); //Wait for all cells to be added:
        this.setState({cells: cells});
    }

    async fetchAndAddCubeObjectsForTwoAxis(axis1: Axis, axis2:Axis){
        let cells: Cell[] = [];
        let promises = axis1.LabelThreeObjectsAndTags.map(async (otp1: ObjectTagPair, index1) => {
            axis2.LabelThreeObjectsAndTags.map(async (otp2: ObjectTagPair, index2) => {
                let cubeObjectArr = await Fetcher.FetchCubeObjectsWithTagsOTR(otp1.tag, otp2.tag, null);
                let coordinate = {x:0, y:0, z:0};
                switch((axis1.AxisDirection, axis2.AxisDirection)){
                    case (AxisDirection.x, AxisDirection.y):    //x and y
                        coordinate.x += 1 + index1;
                        coordinate.y += 1 + index2;
                        break;
                    case (AxisDirection.x, AxisDirection.z):    //x and z
                        coordinate.x += 1 + index1;
                        coordinate.z += 1 + index2;
                        break;
                    case (AxisDirection.y, AxisDirection.z):    //y and z
                        coordinate.y += 1 + index1;
                        coordinate.z += 1 + index2;
                        break;
                }
                let cell = new Cell(this.scene, this.textLoader, coordinate, cubeObjectArr);
                cells.push(cell);
            });
        });
        await Promise.all(promises); //Wait for all cells to be added:
        this.setState({cells: cells});
    }

    async fetchAndAddCubeObjectsForThreeAxis(axis1: Axis, axis2:Axis, axis3:Axis){
        console.log(axis1.LabelThreeObjectsAndTags.length + ", " + 
            axis2.LabelThreeObjectsAndTags.length + ", " +
            axis3.LabelThreeObjectsAndTags.length);
        let cells: Cell[] = [];
        let promises = axis1.LabelThreeObjectsAndTags.map(async (otp1: ObjectTagPair, index1) => {
            axis2.LabelThreeObjectsAndTags.map(async (otp2: ObjectTagPair, index2) => {
                axis3.LabelThreeObjectsAndTags.map(async (otp3: ObjectTagPair, index3) => {
                    let cubeObjectArr = await Fetcher.FetchCubeObjectsWithTagsOTR(otp1.tag, otp2.tag, otp3.tag);
                    let coordinate = {x:0, y:0, z:0};
                    //x and y and z:
                    coordinate.x += 1 + index1;
                    coordinate.y += 1 + index2;
                    coordinate.z += 1 + index3;
                    let cell = new Cell(this.scene, this.textLoader, coordinate, cubeObjectArr);
                    cells.push(cell);
                });
            });
        });
        await Promise.all(promises); //Wait for all cells to be added:
        this.setState({cells: cells});
    }

    async computeCells(){
        //Remove previous cells:
        this.state.cells.forEach((cell: Cell) => cell.RemoveFromScene());
        
        this.setState({cells: []});

        //Clear cache:
        sessionStorage.clear();

        //Fetch and add new cells:
        let xDefined : boolean = this.state.xAxis.TitleString != "X";
        let yDefined : boolean = this.state.yAxis.TitleString != "Y";
        let zDefined : boolean = this.state.zAxis.TitleString != "Z";
        let promise: Promise<void>;
        if(xDefined && yDefined && zDefined){   //X and Y and Z
            //Render all three axis
            promise = this.fetchAndAddCubeObjectsForThreeAxis(this.state.xAxis, this.state.yAxis, this.state.zAxis);
        }else if(xDefined && yDefined){         //X and Y
            promise = this.fetchAndAddCubeObjectsForTwoAxis(this.state.xAxis, this.state.yAxis);
        }else if(xDefined && zDefined){         //X and Z
            promise = this.fetchAndAddCubeObjectsForTwoAxis(this.state.xAxis, this.state.zAxis);
        }else if(yDefined && zDefined){         //Y and Z
            promise = this.fetchAndAddCubeObjectsForTwoAxis(this.state.yAxis, this.state.zAxis);
        }else if(xDefined){                     //X
            promise = this.fetchAndAddCubeObjectsForOneAxis(this.state.xAxis);
        }else if(yDefined){                     //Y
            promise = this.fetchAndAddCubeObjectsForOneAxis(this.state.yAxis);
        }else if(zDefined){                     //Z
            promise = this.fetchAndAddCubeObjectsForOneAxis(this.state.zAxis);
        }

        await promise!;

        //Update filecount:
        let uniquePhotoIds: Set<number> = new Set();
        this.state.cells.forEach((cell: Cell) => 
            cell.cubeObjectData.forEach(co => uniquePhotoIds.add(co.PhotoId)));
        this.props.onFileCountChanged(uniquePhotoIds.size);
    }
}
        
export default ThreeBrowser;