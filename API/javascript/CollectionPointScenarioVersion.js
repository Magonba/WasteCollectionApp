"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionPointScenarioVersion = void 0;
var MapNode_1 = require("./MapNode");
var CollectionPointScenarioVersion = /** @class */ (function () {
    function CollectionPointScenarioVersion(timing, nodesPotCP) {
        this.timing = timing;
        this.nodesPotCP = nodesPotCP;
    }
    return CollectionPointScenarioVersion;
}());
exports.CollectionPointScenarioVersion = CollectionPointScenarioVersion;
console.log(new CollectionPointScenarioVersion("111", [[new MapNode_1.MapNode(1, 1, 1, true, true), true]]));
//# sourceMappingURL=CollectionPointScenarioVersion.js.map