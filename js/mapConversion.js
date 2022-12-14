import * as OpenSkyModel from "./openSkyModel.js";

var displacement;

//Displacement calculation
export function displacementCalculation(){
    
    let longDispDegrees = OpenSkyModel.LONG_MIN+((OpenSkyModel.LONG_MAX - OpenSkyModel.LONG_MIN)/2);
    let latDispDegrees = OpenSkyModel.LAT_MIN+((OpenSkyModel.LAT_MAX - OpenSkyModel.LAT_MIN)/2);
    
    displacement = degreeToMeter(latDispDegrees,longDispDegrees);
}

export function degreeToMeter(lat,long){
    let latlng = new L.latLng(lat, long);
    return L.Projection.Mercator.project(latlng);
}

export function meterToDegree(mercatorVector){
    let point = {x:mercatorVector.x,y:mercatorVector.z};
    return  L.Projection.Mercator.unproject(point);
}

//Esta función comvierte una coordenada mercator a una coordenada en el mundo 3d
//En el 3d tenemos conversiones de factor , desplazamiento y cambio de ejes.
export function mercatorToWorld(mercatorVector){
    let xWorld = (mercatorVector.x-displacement.x)/OpenSkyModel.FACTOR;
    let yWorld = (mercatorVector.z-displacement.y)/OpenSkyModel.FACTOR;
    let altitudeWorld = mercatorVector.y == null ? 0: mercatorVector.y/OpenSkyModel.FACTOR;

    return {x:xWorld,y:altitudeWorld,z:-yWorld};
}

//Convierte los datos del mundo 3D a un vector en mercator en metros
export function worldtoMercator(worldVector){
    let xMercator = (worldVector.x*OpenSkyModel.FACTOR)+displacement.x;
    let yMercator = (-worldVector.z*OpenSkyModel.FACTOR)+displacement.y;
    let altitude = worldVector.y*OpenSkyModel.FACTOR;

    return {x:xMercator,y:altitude,z:yMercator};
}

//función que convierte una coordenada WGS84 en grados en un vector del escenario con sus transformaciones afines.
export function degreeToWorld(lat,long){
    let point = degreeToMeter(lat,long);
    return mercatorToWorld({x:point.x,y:0,z:point.y});
}

//función que convierte una coordenada del escenario a la coordenada correspondiente a WGS84 en grados.
export function worldToDegree(worldVector){
    let mercatorVector = worldtoMercator(worldVector);
    return meterToDegree(mercatorVector);
}




export function createCorner(long, lat,id,mainScene) {
    //CORNERS MERS
    let entityEl = document.createElement('a-entity');
    entityEl.setAttribute('id', id);
    entityEl.setAttribute('geometry', {
        primitive: 'box',
        width: 10,
        height: 9000,
        depth:10
    });
    let point = degreeToMeter(lat,long);
    let mercator = mercatorToWorld({x:point.x,y:0,z:point.y});
    entityEl.setAttribute('position', mercator);
    mainScene.appendChild(entityEl);
}

export function getGroundSize() {

    let latlongMax = degreeToMeter(OpenSkyModel.LAT_MAX, OpenSkyModel.LONG_MAX);
    let sizeMeters = mercatorToWorld({x:latlongMax.x,y:0,z:latlongMax.y});
    return {
        width: Math.abs(sizeMeters.x * 2),
        height: Math.abs(sizeMeters.z * 2)
    };
}

