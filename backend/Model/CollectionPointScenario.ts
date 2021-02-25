import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { CollectionPointScenarioVersion } from './CollectionPointScenarioVersion';
import { MapNode } from './MapNode';

export class CollectionPointScenario {
    private title: string;
    private collectionPointScenarioVersions: CollectionPointScenarioVersion[];

    private constructor(title: string, collectionPointScenarioVersions: CollectionPointScenarioVersion[]) {
        this.title = title;
        this.collectionPointScenarioVersions = collectionPointScenarioVersions;
    }

    public static async getCollectionPointScenariosObjects(
        projectname: string,
        nodes: MapNode[],
    ): Promise<CollectionPointScenario[]> {
        const collPointsScenariosFromDB: Record<string, string | number | boolean | Date>[] = await (
            await DatabaseHandler.getDatabaseHandler()
        ).querying(`SELECT * FROM ${projectname}.collectionpointscenarios`);

        const collectionPointScenarios: CollectionPointScenario[] = [];

        for (let index = 0; index < collPointsScenariosFromDB.length; index = index + 1) {
            const collPointsScenarioFromDB: Record<string, string | number | boolean | Date> =
                collPointsScenariosFromDB[index];

            if (typeof collPointsScenarioFromDB.title === 'string') {
                //create CollectionPointScenario
                //by getting its CollectionPointScenarioVersions (by its title)
                const collectionPointScenarioVersions: CollectionPointScenarioVersion[] = await CollectionPointScenarioVersion.getCollectionPointScenarioVersionsObjects(
                    projectname,
                    collPointsScenarioFromDB.title,
                    nodes,
                );

                //then construct the CollectionPointScenario Object with its title and CollectionPointScenarioVersions
                const collectionPointScenario: CollectionPointScenario = new CollectionPointScenario(
                    collPointsScenarioFromDB.title,
                    collectionPointScenarioVersions,
                );

                //and push it to the array
                collectionPointScenarios.push(collectionPointScenario);
            } else {
                const err: Error = new Error('One of the properties (title) do not have the correct type!');
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            }
        }
        return collectionPointScenarios;
    }

    public getTitle(): string {
        return this.title;
    }

    public getCollectionPointScenarioVersions(): CollectionPointScenarioVersion[] {
        return this.collectionPointScenarioVersions;
    }
}
