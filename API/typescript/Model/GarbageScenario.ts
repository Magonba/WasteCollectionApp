import {GarbageScenarioVersion} from './GarbageScenarioVersion';

export class GarbageScenario {
    title: string;
    garbageScenarioVersions: GarbageScenarioVersion[];

    constructor(title: string, garbageScenarioVersions: GarbageScenarioVersion[]){
        this.title = title;
        this.garbageScenarioVersions = garbageScenarioVersions;
    }
}
