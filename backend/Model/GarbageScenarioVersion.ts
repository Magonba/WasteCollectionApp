import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapNode } from './MapNode';

export class GarbageScenarioVersion {
    private gscTitle: string;
    private timing: Date; //maybe adapt (not string)
    private nodesWaste: [MapNode, number][]; //referenced MapNode and wasteEstimation

    private constructor(gscTitle: string, timing: Date, nodesWaste: [MapNode, number][]) {
        this.gscTitle = gscTitle;
        this.timing = timing;
        this.nodesWaste = nodesWaste;
    }

    public static async createGarbageScenarioVersion(
        projectname: string,
        title: string,
        timing: Date,
        nodesWaste: [MapNode, number][],
    ): Promise<GarbageScenarioVersion> {
        const garbageScenarioVersion: GarbageScenarioVersion = new GarbageScenarioVersion(title, timing, nodesWaste);

        const timingToString = `${timing.getFullYear()}-${
            timing.getMonth() + 1
        }-${timing.getDate()} ${timing.getHours()}:${timing.getMinutes()}:${timing.getSeconds()}.${timing.getMilliseconds()}`;

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `INSERT INTO ${projectname}.garbagescenarioversions VALUES ('${title}', TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS'));`,
            )
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        for (let index = 0; index < nodesWaste.length; index = index + 1) {
            await (await DatabaseHandler.getDatabaseHandler())
                .querying(
                    `INSERT INTO ${projectname}.garbagescenarioversions_nodes_waste VALUES (${nodesWaste[
                        index
                    ][0].getNodeID()}, '${title}', TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS'), ${
                        nodesWaste[index][1]
                    });`,
                )
                .catch((err: Error) => {
                    Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                    throw err;
                });
        }
        return garbageScenarioVersion;
    }

    public static async getGarbageScenarioVersionsObjects(
        projectname: string,
        title: string,
        nodes: MapNode[],
    ): Promise<GarbageScenarioVersion[]> {
        const garbScenVersionsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.garbagescenarioversions WHERE title = '${title}'`);

        const garbageScenarioVersions: GarbageScenarioVersion[] = [];

        for (let index = 0; index < garbScenVersionsFromDB.length; index = index + 1) {
            const garbScenVersionFromDB: Record<string, string | number | boolean | Date> =
                garbScenVersionsFromDB[index];

            if (typeof garbScenVersionFromDB.title === 'string' && garbScenVersionFromDB.timing instanceof Date) {
                //create GarbageScenarioVersion
                //by querying garbagescenarioversions_nodes_waste table
                const timingToString = `${garbScenVersionFromDB.timing.getFullYear()}-${
                    garbScenVersionFromDB.timing.getMonth() + 1
                }-${garbScenVersionFromDB.timing.getDate()} ${garbScenVersionFromDB.timing.getHours()}:${garbScenVersionFromDB.timing.getMinutes()}:${garbScenVersionFromDB.timing.getSeconds()}.${garbScenVersionFromDB.timing.getMilliseconds()}`;

                const nodesWasteFromDB: Record<string, string | number | boolean | Date>[] = await (
                    await DatabaseHandler.getDatabaseHandler()
                ).querying(
                    `SELECT * FROM ${projectname}.garbagescenarioversions_nodes_waste WHERE title = '${title}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS')`,
                );

                //then initialize nodeswaste array variable correctly
                const nodesWaste: [MapNode, number][] = [];

                for (let index = 0; index < nodesWasteFromDB.length; index = index + 1) {
                    const nodeWasteFromDB: Record<string, string | number | boolean | Date> = nodesWasteFromDB[index];

                    if (
                        typeof nodeWasteFromDB.nodeid === 'number' &&
                        typeof nodeWasteFromDB.title === 'string' &&
                        nodeWasteFromDB.timing instanceof Date &&
                        typeof nodeWasteFromDB.wasteamount === 'number'
                    ) {
                        //create nodesWaste element
                        //by searching in nodes for MapNode with nodeid
                        const wasteNode: MapNode | undefined = nodes.find((node) => {
                            return node.getNodeID() === nodeWasteFromDB.nodeid;
                        });

                        //check if wasteNode is undefined (i.e. if it was found in the nodes array)
                        if (typeof wasteNode === 'undefined') {
                            const err: Error = new Error('wasteNode is undefined');
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        }

                        //then push [MapNode, wasteamount] to nodesWaste
                        nodesWaste.push([wasteNode, nodeWasteFromDB.wasteamount]);
                    } else {
                        const err: Error = new Error(
                            'One of the properties (nodeid, title, timing, wasteamount) do not have the correct type!',
                        );
                        Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                        throw err;
                    }
                }
                //then create GarbageScenarioVersion object
                const garbageScenarioVersion: GarbageScenarioVersion = new GarbageScenarioVersion(
                    title,
                    garbScenVersionFromDB.timing,
                    nodesWaste,
                );

                //and push it into the garbageScenarioVersions array
                garbageScenarioVersions.push(garbageScenarioVersion);
            } else {
                const err: Error = new Error('One of the properties (title, timing) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return garbageScenarioVersions;
    }

    public getGSTitle(): string {
        return this.gscTitle;
    }

    //should only be called from GarbageScenario (when setting the title)
    public setGSTitle(gscTitle: string): void {
        this.gscTitle = gscTitle;
    }

    public getTiming(): Date {
        return this.timing;
    }

    public getNodesWaste(): [MapNode, number][] {
        return this.nodesWaste;
    }
}
