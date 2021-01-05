"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleTypeVersion = void 0;
var MapArc_1 = require("./MapArc");
var MapNode_1 = require("./MapNode");
var VehicleTypeVersion = /** @class */ (function () {
    function VehicleTypeVersion(timing, averageSpeed, averageStopTime, vehicleCapacity, arcsActivated) {
        this.timing = timing;
        this.averageSpeed = averageSpeed;
        this.averageStopTime = averageStopTime;
        this.vehicleCapacity = vehicleCapacity;
        this.arcsActivated = arcsActivated;
    }
    return VehicleTypeVersion;
}());
exports.VehicleTypeVersion = VehicleTypeVersion;
console.log(new VehicleTypeVersion("111", 1, 1, 1, [[new MapArc_1.MapArc(new MapNode_1.MapNode(1, 1, 1, true, true), new MapNode_1.MapNode(2, 1, 1, true, true), 30), true]]));
//# sourceMappingURL=VehicleTypeVersion.js.map