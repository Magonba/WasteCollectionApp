import {MapNode} from './MapNode';

export class CollectionPointScenarioVersion {
    timing: string; //maybe adapt (not string)
    nodesPotCP: [MapNode, boolean][]; //referenced MapNode and boolean potentialCollectionPoint

    constructor(timing: string, nodesPotCP: [MapNode, boolean][]){
        this.timing = timing;
        this.nodesPotCP = nodesPotCP;
    }
}
console.log(new CollectionPointScenarioVersion("111", [[new MapNode(1, 1, 1, true, true), true]]));
