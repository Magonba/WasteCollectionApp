import {MapNode} from './MapNode';

export class CollectionPointScenarioVersion {
    timing: string; //maybe adapt (not string)
    nodesPotCP: [MapNode, boolean][]; //referenced MapNode and boolean potentialCollectionPoint

    constructor(timing: string, nodesPotCP: [MapNode, boolean][]){
        this.timing = timing;
        this.nodesPotCP = nodesPotCP;
    }
}
