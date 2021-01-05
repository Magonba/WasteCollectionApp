import {MapNode} from './MapNode';

export class Tour {
    id: number;
    tourtime: number;
    tourwaste: number;
    tourNodes: [MapNode, number, number][]; //[[node1, wasteCollected1, ordering1],...]

    constructor(id: number, tourtime: number, tourwaste: number, tourNodes: [MapNode, number, number][]){
        this.id = id;
        this.tourtime = tourtime;
        this.tourwaste = tourwaste;
        this.tourNodes = tourNodes;
    }
}
