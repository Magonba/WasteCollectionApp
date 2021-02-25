import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';

export class MapNode {
    private id: number;
    private xCoordinate: number;
    private yCoordinate: number;
    private vehicleDepot: boolean;
    private wasteDepot: boolean;

    private constructor(
        id: number,
        xCoordinate: number,
        yCoordinate: number,
        vehicleDepot: boolean,
        wasteDepot: boolean,
    ) {
        this.id = id;
        this.xCoordinate = xCoordinate;
        this.yCoordinate = yCoordinate;
        this.vehicleDepot = vehicleDepot;
        this.wasteDepot = wasteDepot;
    }

    public static async getNodesObjects(projectname: string): Promise<MapNode[]> {
        const nodesFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.nodes`);

        const nodes: MapNode[] = [];

        for (let index = 0; index < nodesFromDB.length; index = index + 1) {
            const nodeFromDB: Record<string, string | number | boolean | Date> = nodesFromDB[index];

            if (
                typeof nodeFromDB.nodeid === 'number' &&
                typeof nodeFromDB.xcoordinate === 'number' &&
                typeof nodeFromDB.ycoordinate === 'number' &&
                typeof nodeFromDB.vehicledepot === 'boolean' &&
                typeof nodeFromDB.wastedepot === 'boolean'
            ) {
                nodes.push(
                    new MapNode(
                        nodeFromDB.nodeid,
                        nodeFromDB.xcoordinate,
                        nodeFromDB.ycoordinate,
                        nodeFromDB.vehicledepot,
                        nodeFromDB.wastedepot,
                    ),
                );
            } else {
                const err: Error = new Error(
                    'One of the properties (nodeid, xcoordinate, ycoordinate, vehicledepot, wastedepot) do not have the correct type!',
                );
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }

        return nodes;
    }

    public static async createNode(
        id: number,
        xCoordinate: number,
        yCoordinate: number,
        vehicleDepot: boolean,
        wasteDepot: boolean,
    ): Promise<MapNode> {
        //create new node
        //by creating an object of a new node
        //then by adding new row to database
        throw new Error('Not implemented method');
    }

    public getNodeID(): number {
        return this.id;
    }

    public getXCoordinate(): number {
        return this.xCoordinate;
    }

    public getYCoordinate(): number {
        return this.yCoordinate;
    }

    public getVehicleDepot(): boolean {
        return this.vehicleDepot;
    }

    public getWasteDepot(): boolean {
        return this.wasteDepot;
    }
}
