import {MapArc} from './MapArc';
//import {MapNode} from './MapNode';

export class VehicleTypeVersion {
    timing: string; //maybe adapt (not string)
    averageSpeed: number;
    averageStopTime: number;
    vehicleCapacity: number;
    arcsActivated: [MapArc, boolean][]; //referenced MapArc and boolean for activation

    constructor(timing: string, averageSpeed: number, averageStopTime: number, vehicleCapacity: number, arcsActivated: [MapArc, boolean][]){
        this.timing = timing;
        this.averageSpeed = averageSpeed;
        this.averageStopTime = averageStopTime;
        this.vehicleCapacity = vehicleCapacity;
        this.arcsActivated = arcsActivated;
    }
}
