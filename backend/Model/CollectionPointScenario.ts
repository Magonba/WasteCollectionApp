import { DatabaseHandler } from '../Database/DatabaseHandler';
import { Logger } from '../Logger/Logger';
import { CollectionPointScenarioVersion } from './CollectionPointScenarioVersion';
import { MapNode } from './MapNode';
import { Result } from './Result';

export class CollectionPointScenario {
    private title: string;
    private collectionPointScenarioVersions: CollectionPointScenarioVersion[];

    private constructor(title: string, collectionPointScenarioVersions: CollectionPointScenarioVersion[]) {
        this.title = title;
        this.collectionPointScenarioVersions = collectionPointScenarioVersions;
    }

    public static async createCollectionPointScenario(
        projectname: string,
        title: string,
    ): Promise<CollectionPointScenario> {
        const collectionPointScenario: CollectionPointScenario = new CollectionPointScenario(title, []);

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(`INSERT INTO ${projectname}.collectionpointscenarios VALUES ('${title}');`)
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        return collectionPointScenario;
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

    public async setTitle(projectname: string, title: string): Promise<void> {
        //change title in database
        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `UPDATE ${projectname}.collectionpointscenarios
                SET title = '${title}'
                WHERE title = '${this.title}';`,
            )
            .then(() => {
                //only if db query successful change title in memory
                this.title = title;

                //set title for each cpsversion
                for (let index = 0; index < this.collectionPointScenarioVersions.length; index = index + 1) {
                    this.collectionPointScenarioVersions[index].setCPSTitle(title);
                }
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });
    }

    public getCollectionPointScenarioVersions(): CollectionPointScenarioVersion[] {
        return this.collectionPointScenarioVersions;
    }

    public async addCollectionPointScenarioVersion(
        projectname: string,
        timing: Date,
        nodesPotCP: [MapNode, boolean][],
    ): Promise<CollectionPointScenarioVersion> {
        const collectionPointScenarioVersion: CollectionPointScenarioVersion = await CollectionPointScenarioVersion.createCollectionPointScenarioVersion(
            projectname,
            this.title,
            timing,
            nodesPotCP,
        );

        this.collectionPointScenarioVersions.push(collectionPointScenarioVersion);

        return collectionPointScenarioVersion;
    }

    public async deleteCollectionPointScenarioVersion(
        projectname: string,
        collectionPointScenarioVersion: CollectionPointScenarioVersion,
        results: Result[],
    ): Promise<void> {
        //delete cpsv in database
        const timingToString = `${collectionPointScenarioVersion.getTiming().getFullYear()}-${
            collectionPointScenarioVersion.getTiming().getMonth() + 1
        }-${collectionPointScenarioVersion
            .getTiming()
            .getDate()} ${collectionPointScenarioVersion
            .getTiming()
            .getHours()}:${collectionPointScenarioVersion
            .getTiming()
            .getMinutes()}:${collectionPointScenarioVersion
            .getTiming()
            .getSeconds()}.${collectionPointScenarioVersion.getTiming().getMilliseconds()}`;

        await (await DatabaseHandler.getDatabaseHandler())
            .querying(
                `DELETE FROM ${projectname}.collectionpointscenarioversions WHERE title = '${this.title}' AND timing = TO_TIMESTAMP('${timingToString}', 'YYYY-MM-DD HH24:MI:SS.MS');`,
            )
            .then(() => {
                //only if db query successful delete collectionpointscenarioversion from array
                this.collectionPointScenarioVersions = this.collectionPointScenarioVersions.filter((cpsv) => {
                    return cpsv !== collectionPointScenarioVersion;
                });
            })
            .catch((err: Error) => {
                Logger.getLogger().fileAndConsoleLog(err.stack === undefined ? '' : err.stack, 'error');
                throw err;
            });

        //delete also results with those cpsvs
        for (let index = 0; index < results.length; index = index + 1) {
            if (
                results[index].getCollectionPointScenarioVersion().getTiming().getTime() ===
                collectionPointScenarioVersion.getTiming().getTime()
            ) {
                results.splice(results.indexOf(results[index]), 1);
            }
        }
    }
}
