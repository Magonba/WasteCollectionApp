import { MapNode } from './MapNode';
import { MapArc } from './MapArc';

export class Graph {
    nodes: MapNode[];
    arcs: MapArc[];

    constructor(nodes: MapNode[], arcs: MapArc[]) {
        this.nodes = nodes;
        this.arcs = arcs;
    }
}
