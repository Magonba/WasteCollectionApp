import {User} from './User';
import {Graph} from './Graph';
import {GarbageScenario} from './GarbageScenario';
import {CollectionPointScenario} from './CollectionPointScenario';
import {VehicleType} from './VehicleType';
import {Result} from './Result';

export class Project {
    projectname: string;
    users: User[];
    graph: Graph;
    garbageScenarios: GarbageScenario[];
    collectionPointScenarios: CollectionPointScenario[];
    vehicleTypes: VehicleType[];
    results: Result[];

    constructor(projectname: string, users: User[], graph: Graph, garbageScenarios: GarbageScenario[], collectionPointScenarios: CollectionPointScenario[], vehicleTypes: VehicleType[], results: Result[]){
        this.projectname = projectname;
        this.users = users;
        this.graph = graph;
        this.garbageScenarios = garbageScenarios;
        this.collectionPointScenarios = collectionPointScenarios;
        this.vehicleTypes = vehicleTypes;
        this.results = results;
    }
}
