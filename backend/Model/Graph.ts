import { MapNode } from './MapNode';
import { MapArc } from './MapArc';

export class Graph {
    private nodes: MapNode[];
    private arcs: MapArc[];

    private constructor(nodes: MapNode[], arcs: MapArc[]) {
        this.nodes = nodes;
        this.arcs = arcs;
    }

    public static async getGraphObject(projectname: string): Promise<Graph> {
        const nodes: MapNode[] = await MapNode.getNodesObjects(projectname);
        const arcs: MapArc[] = await MapArc.getArcsObjects(projectname, nodes);

        return new Graph(nodes, arcs);
    }

    public static createGraph(nodes: MapNode[], arcs: MapArc[]): Graph {
        return new Graph(nodes, arcs);
    }

    public getNodes(): MapNode[] {
        return this.nodes;
    }

    public getArcs(): MapArc[] {
        return this.arcs;
    }
}
