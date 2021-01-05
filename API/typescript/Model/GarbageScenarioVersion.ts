import {MapNode} from './MapNode';

export class GarbageScenarioVersion {
    timing: string; //maybe adapt (not string)
    nodesWaste: [MapNode, number][]; //referenced MapNode and wasteEstimation

    constructor(timing: string, nodesWaste: [MapNode, number][]){
        this.timing = timing;
        this.nodesWaste = nodesWaste;
    }
}
