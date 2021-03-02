import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { MapNode } from './MapNode';

export class CollectionPointScenarioVersion {
    private timing: Date; //maybe adapt (not string)
    private nodesPotCP: [MapNode, boolean][]; //referenced MapNode and boolean potentialCollectionPoint

    private constructor(timing: Date, nodesPotCP: [MapNode, boolean][]) {
        this.timing = timing;
        this.nodesPotCP = nodesPotCP;
    }

    public static async getCollectionPointScenarioVersionsObjects(
        projectname: string,
        title: string,
        nodes: MapNode[],
    ): Promise<CollectionPointScenarioVersion[]> {
        const collPointScenVersionsFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.collectionpointscenarioversions WHERE title = '${title}'`);

        const collectionPointScenarioVersions: CollectionPointScenarioVersion[] = [];

        for (let index = 0; index < collPointScenVersionsFromDB.length; index = index + 1) {
            const collPointScenVersionFromDB: Record<string, string | number | boolean | Date> =
                collPointScenVersionsFromDB[index];

            if (
                typeof collPointScenVersionFromDB.title === 'string' &&
                collPointScenVersionFromDB.timing instanceof Date
            ) {
                //create CollectionPointScenarioVersion
                //by querying collectionpointscenarioversions_nodes_potcp table
                const timingToString = `${collPointScenVersionFromDB.timing.getFullYear()}-${
                    collPointScenVersionFromDB.timing.getMonth() + 1
                }-${collPointScenVersionFromDB.timing.getDate()} ${collPointScenVersionFromDB.timing.getHours()}:${collPointScenVersionFromDB.timing.getMinutes()}:${collPointScenVersionFromDB.timing.getSeconds()}.${collPointScenVersionFromDB.timing.getMilliseconds()}`;

                const nodesPotCPFromDB: Record<string, string | number | boolean | Date>[] = await (
                    await DatabaseHandler.getDatabaseHandler()
                ).querying(
                    `SELECT * FROM ${projectname}.collectionpointscenarioversions_nodes_potcp WHERE title = '${title}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH:MI:SS.MS')`,
                );

                //then initialize nodesPotCP array variable correctly
                const nodesPotCP: [MapNode, boolean][] = [];

                for (let index = 0; index < nodesPotCPFromDB.length; index = index + 1) {
                    const nodePotCPFromDB: Record<string, string | number | boolean | Date> = nodesPotCPFromDB[index];

                    if (
                        typeof nodePotCPFromDB.nodeid === 'number' &&
                        typeof nodePotCPFromDB.title === 'string' &&
                        nodePotCPFromDB.timing instanceof Date &&
                        typeof nodePotCPFromDB.potentialcollectionpoint === 'boolean'
                    ) {
                        //create nodesPotCP element
                        //by searching in nodes for MapNode with nodeid
                        const potCPNode: MapNode | undefined = nodes.find((node) => {
                            return node.getNodeID() === nodePotCPFromDB.nodeid;
                        });

                        //check if potCPNode is undefined (i.e. if it was found in the nodes array)
                        if (typeof potCPNode === 'undefined') {
                            const err: Error = new Error('potCPNode is undefined');
                            Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                            throw err;
                        }

                        //then push [MapNode, potentialcollectionpoint] to nodesPotCP
                        nodesPotCP.push([potCPNode, nodePotCPFromDB.potentialcollectionpoint]);
                    } else {
                        const err: Error = new Error(
                            'One of the properties (nodeid, title, timing, potentialcollectionpoint) do not have the correct type!',
                        );
                        Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                        throw err;
                    }
                }

                //then create CollectionPointScenarioVersion object
                const collectionPointScenarioVersion: CollectionPointScenarioVersion = new CollectionPointScenarioVersion(
                    collPointScenVersionFromDB.timing,
                    nodesPotCP,
                );

                //and push it into the collectionPointScenarioVersions array
                collectionPointScenarioVersions.push(collectionPointScenarioVersion);
            } else {
                const err: Error = new Error('One of the properties (title, timing) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return collectionPointScenarioVersions;
    }

    public getTiming(): Date {
        return this.timing;
    }

    public getNodesPotCP(): [MapNode, boolean][] {
        return this.nodesPotCP;
    }
}
