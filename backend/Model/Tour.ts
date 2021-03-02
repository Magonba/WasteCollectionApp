import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapNode } from './MapNode';

export class Tour {
    private id: number;
    private tourtime: number;
    private tourwaste: number;
    private tourNodes: [MapNode, number, number][]; //[[node1, wasteCollected1, ordering1],...]

    private constructor(id: number, tourtime: number, tourwaste: number, tourNodes: [MapNode, number, number][]) {
        this.id = id;
        this.tourtime = tourtime;
        this.tourwaste = tourwaste;
        this.tourNodes = tourNodes;
    }

    public static async createTour(
        projectname: string,
        id: number,
        timingResult: Date,
        tourtime: number,
        tourwaste: number,
        tourNodes: [MapNode, number, number][],
    ): Promise<Tour> {
        const timingResultToString = `${timingResult.getFullYear()}-${
            timingResult.getMonth() + 1
        }-${timingResult.getDate()} ${timingResult.getHours()}:${timingResult.getMinutes()}:${timingResult.getSeconds()}.${timingResult.getMilliseconds()}`;

        await (await DatabaseHandler.getDatabaseHandler()).querying(
            `INSERT INTO ${projectname}.tours VALUES (${id}, TO_TIMESTAMP('${timingResultToString}', 'YYYY-MM-DD HH:MI:SS.MS'), ${tourtime}, ${tourwaste});`,
        );

        for (let index = 0; index < tourNodes.length; index = index + 1) {
            await (await DatabaseHandler.getDatabaseHandler()).querying(
                `INSERT INTO ${projectname}.tour_nodes VALUES (${tourNodes[index][0].getNodeID()}, ${id}, ${
                    tourNodes[index][1]
                }, ${tourNodes[index][2]});`,
            );
        }

        return new Tour(id, tourtime, tourwaste, tourNodes);
    }

    public static async getToursObjects(projectname: string, resultTiming: Date, nodes: MapNode[]): Promise<Tour[]> {
        //get Tours
        //by querying tours table
        const timingToString = `${resultTiming.getFullYear()}-${
            resultTiming.getMonth() + 1
        }-${resultTiming.getDate()} ${resultTiming.getHours()}:${resultTiming.getMinutes()}:${resultTiming.getSeconds()}.${resultTiming.getMilliseconds()}`;

        const toursFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(
            `SELECT * FROM ${projectname}.tours WHERE timingresult = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH:MI:SS.MS')`,
        );

        //create tours variable
        const tours: Tour[] = [];

        //then for each tourFromDB create tourNodes by
        //querying tour_nodes (by tourid) and assign each row to a new tour-nodes variable
        for (let index = 0; index < toursFromDB.length; index = index + 1) {
            const tourFromDB: Record<string, string | number | boolean | Date> = toursFromDB[index];

            if (
                typeof tourFromDB.id === 'number' &&
                tourFromDB.timingresult instanceof Date &&
                typeof tourFromDB.tourtime === 'number' &&
                typeof tourFromDB.tourwaste === 'number'
            ) {
                const tourNodesFromDB: Record<string, string | number | boolean | Date>[] = await (
                    await DatabaseHandler.getDatabaseHandler()
                ).querying(`SELECT * FROM ${projectname}.tour_nodes WHERE tourid = ${tourFromDB.id}`);

                //create empty tourNodes variable and fill it up later
                const tourNodes: [MapNode, number, number][] = [];

                for (let index = 0; index < tourNodesFromDB.length; index = index + 1) {
                    const tourNodeFromDB: Record<string, string | number | boolean | Date> = tourNodesFromDB[index];

                    if (
                        typeof tourNodeFromDB.nodeid === 'number' &&
                        typeof tourNodeFromDB.tourid === 'number' &&
                        typeof tourNodeFromDB.wastecollected === 'number' &&
                        typeof tourNodeFromDB.ordering === 'number'
                    ) {
                        const nodeOfTour: MapNode | undefined = nodes.find((node) => {
                            return node.getNodeID() === tourNodeFromDB.nodeid;
                        });

                        if (!(nodeOfTour instanceof MapNode)) {
                            const err: Error = new Error('No MapNode found with corresponding nodeID!');
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        }

                        const tourNode: [MapNode, number, number] = [
                            nodeOfTour,
                            tourNodeFromDB.wastecollected,
                            tourNodeFromDB.ordering,
                        ];

                        //push tourNode to tourNodes
                        tourNodes.push(tourNode);
                    } else {
                        const err: Error = new Error(
                            'One of the properties (nodeid, tourid, wastecollected, ordering) do not have the correct type!',
                        );
                        Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                        throw err;
                    }
                }
                //create Tour object
                const tour: Tour = new Tour(tourFromDB.id, tourFromDB.tourtime, tourFromDB.tourwaste, tourNodes);

                //push tour to tours array
                tours.push(tour);
            } else {
                const err: Error = new Error(
                    'One of the properties (id, timingresult, tourtime, tourwaste) do not have the correct type!',
                );
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return tours;
    }

    public getTourID(): number {
        return this.id;
    }

    public getTourTime(): number {
        return this.tourtime;
    }

    public getTourWaste(): number {
        return this.tourwaste;
    }

    public getTourNodes(): [MapNode, number, number][] {
        return this.tourNodes;
    }
}
