import {GarbageScenarioVersion} from './GarbageScenarioVersion';
import {CollectionPointScenarioVersion} from './CollectionPointScenarioVersion';
import {VehicleTypeVersion} from './VehicleTypeVersion';
import {Tour} from './Tour';

export class Result {
    timing: string;
    garbageScenarioVersion: GarbageScenarioVersion;
    collectionPointScenarioVersion: CollectionPointScenarioVersion;
    vehicleTypeVersions: VehicleTypeVersion[];
    model: string;
    maxWalkingDistance: number;
    totalTime: number;
    tours: Tour[];

    constructor(timing: string, garbageScenarioVersion: GarbageScenarioVersion, collectionPointScenarioVersion: CollectionPointScenarioVersion, vehicleTypeVersions: VehicleTypeVersion[], model: string, maxWalkingDistance: number, totalTime: number, tours: Tour[]){
        this.timing = timing;
        this.garbageScenarioVersion = garbageScenarioVersion;
        this.collectionPointScenarioVersion = collectionPointScenarioVersion;
        this.vehicleTypeVersions = vehicleTypeVersions;
        this.model = model;
        this.maxWalkingDistance = maxWalkingDistance;
        this.totalTime = totalTime;
        this.tours = tours;
    }
}
