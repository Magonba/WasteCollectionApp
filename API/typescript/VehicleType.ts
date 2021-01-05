import {VehicleTypeVersion} from './VehicleTypeVersion';

export class VehicleType {
    title: string;
    vehicleTypeVersions: VehicleTypeVersion[];

    constructor(title: string, vehicleTypeVersions: VehicleTypeVersion[]){
        this.title = title;
        this.vehicleTypeVersions = vehicleTypeVersions;
    }
}
