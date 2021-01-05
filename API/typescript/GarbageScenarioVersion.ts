import {MapNode} from './MapNode';

export class GarbageScenarioVersion {
    timing: string; //maybe adapt (not string)
    nodesWaste: [MapNode, number][]; //referenced MapNode and wasteEstimation

    constructor(timing: string, nodesWaste: [MapNode, number][]){
        this.timing = timing;
        this.nodesWaste = nodesWaste;
    }
}
console.log(new GarbageScenarioVersion("111", [[new MapNode(1, 1, 1, true, true), 100]]));
