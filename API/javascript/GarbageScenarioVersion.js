"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarbageScenarioVersion = void 0;
var MapNode_1 = require("./MapNode");
var GarbageScenarioVersion = /** @class */ (function () {
    function GarbageScenarioVersion(timing, nodesWaste) {
        this.timing = timing;
        this.nodesWaste = nodesWaste;
    }
    return GarbageScenarioVersion;
}());
exports.GarbageScenarioVersion = GarbageScenarioVersion;
console.log(new GarbageScenarioVersion("111", [[new MapNode_1.MapNode(1, 1, 1, true, true), 100]]));
//# sourceMappingURL=GarbageScenarioVersion.js.map