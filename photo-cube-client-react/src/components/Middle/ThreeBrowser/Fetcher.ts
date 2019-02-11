import Axis from "./Axis";
import CubeObject from './CubeObject';
import Position from './Position';

export interface CoordinateObjectPair{
    coordinate: number,
    cubeObjectArr: CubeObject[]
}

export default class Fetcher{
    static baseUrl: string = "https://localhost:44317/api/";

    static async FetchCubeObjectsFromAxis(xAxis: Axis, addCubeCallBack: (url: string, position: Position) => any){
        //let coordinateObjectPairs : Array<CoordinateObjectPair> = [];
        let promises = [];
        
        for(let i = 0; i < xAxis.LabelThreeObjectsAndTags.length ; i++){
            promises.push(fetch(this.baseUrl + "cubeobject/FromTagId/" + xAxis.LabelThreeObjectsAndTags[i].tagInfo.Id)
                .then(result => {return result.json();})
                .then(cubeObjectDataArray => {
                    //coordinateObjectPairs.push({coordinate : i, cubeObjectArr: cubeObjectDataArray});
                    
                    if(cubeObjectDataArray.length > 0){
                        addCubeCallBack("https://localhost:44317/api/photo/" + cubeObjectDataArray[0].PhotoId ,
                            {x:i+1, y:1, z:0}
                        );
                    }
                })
            );
        }

        return await Promise.all(promises);
        //return coordinateObjectPairs;
    }

    static async FetchPhoto(PhotoId: number){
        return await fetch(this.baseUrl + "photo" + PhotoId)
            .then(result => {return result.json();});
    }

    static FetchThumbnail(thumbnailId: number){
        let thumbnailImage = null;

        fetch(this.baseUrl + "thumbnail/" + thumbnailId)
        .then(result => {return result.json();})
        .then(thumbnail => {
            thumbnailImage = thumbnail.Image;
        });
        return thumbnailImage;
    }

    static FetchCubeObjectsFrom2Axis(xAxis: Axis, yAxis: Axis){
        let coordinateObjectPairs : Array<CoordinateObjectPair> = [];

        for(let i = 0; i < xAxis.LabelThreeObjectsAndTags.length ; i++){
            for(let j = 0; j < yAxis.LabelThreeObjectsAndTags.length ; j++){
                fetch(this.baseUrl + "cubeobject/FromTagId/" + xAxis.LabelThreeObjectsAndTags[i].tagInfo.Id) //Add second axis tagInfo
                .then(result => {return result.json();})
                .then(cubeObjectDataArray => {
                    let result = cubeObjectDataArray as CubeObject[];
                    coordinateObjectPairs.push({coordinate : i, cubeObjectArr: result});
                });
            }
        }

        return coordinateObjectPairs;
    }

}