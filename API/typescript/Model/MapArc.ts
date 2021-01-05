import {MapNode} from './MapNode';

export class MapArc {
    sourceNode: MapNode;
    destinationNode: MapNode;
    distance: number;

    constructor(sourceNode: MapNode, destinationNode: MapNode, distance: number){
        this.sourceNode = sourceNode;
        this.destinationNode = destinationNode;
        this.distance = distance;
    }
}
