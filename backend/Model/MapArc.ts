import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapNode } from './MapNode';

export class MapArc {
    private sourceNode: MapNode;
    private destinationNode: MapNode;
    private distance: number;

    private constructor(sourceNode: MapNode, destinationNode: MapNode, distance: number) {
        this.sourceNode = sourceNode;
        this.destinationNode = destinationNode;
        this.distance = distance;
    }

    public static async getArcsObjects(projectname: string, nodes: MapNode[]): Promise<MapArc[]> {
        const arcsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.arcs`);

        const arcs: MapArc[] = [];

        for (let index = 0; index < arcsFromDB.length; index = index + 1) {
            const arcFromDB: Record<string, string | number | boolean | Date> = arcsFromDB[index];

            if (
                typeof arcFromDB.sourcenodeid === 'number' &&
                typeof arcFromDB.destinationnodeid === 'number' &&
                typeof arcFromDB.distance === 'number'
            ) {
                //create arcs
                //by finding nodes by id
                const sourceNode: MapNode | undefined = nodes.find((node) => {
                    return node.getNodeID() === arcFromDB.sourcenodeid;
                });
                const destNode: MapNode | undefined = nodes.find((node) => {
                    return node.getNodeID() === arcFromDB.destinationnodeid;
                });

                //check if source node or dest node are undefined (i.e. if they were found in the nodes array)
                if (typeof sourceNode === 'undefined' || typeof destNode === 'undefined') {
                    const err: Error = new Error('sourceNode or destNode are undefined');
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                }

                //initializing them
                const arc: MapArc = new MapArc(sourceNode, destNode, arcFromDB.distance);

                //and pushing them into the array
                arcs.push(arc);
            } else {
                const err: Error = new Error(
                    'One of the properties (sourcenodeid, destinationnodeid, distance) do not have the correct type!',
                );
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return arcs;
    }

    public static async createArc(
        projectname: string,
        sourceNode: MapNode,
        destinationNode: MapNode,
        distance: number,
    ): Promise<MapArc> {
        //create new arc
        //by creating an object of a new arc
        //then by adding new row to database
        throw new Error('Not implemented method');
    }

    public getSourceNode(): MapNode {
        return this.sourceNode;
    }

    public getDestinationNode(): MapNode {
        return this.destinationNode;
    }

    public getDistance(): number {
        return this.distance;
    }
}
