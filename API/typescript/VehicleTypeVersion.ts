import {MapArc} from './MapArc';
import {MapNode} from './MapNode';

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
console.log(new VehicleTypeVersion("111", 1, 1, 1, [[new MapArc(new MapNode(1, 1, 1, true, true), new MapNode(2, 1, 1, true, true), 30), true]]));
