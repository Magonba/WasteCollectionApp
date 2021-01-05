import {CollectionPointScenarioVersion} from './CollectionPointScenarioVersion';

export class CollectionPointScenario {
    title: string;
    collectionPointScenarioVersions: CollectionPointScenarioVersion[];

    constructor(title: string, collectionPointScenarioVersions: CollectionPointScenarioVersion[]){
        this.title = title;
        this.collectionPointScenarioVersions = collectionPointScenarioVersions;
    }
}
