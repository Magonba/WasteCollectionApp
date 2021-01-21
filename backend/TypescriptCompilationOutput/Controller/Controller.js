"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Model_1 = require("../Model/Model");
var Controller = /** @class */ (function () {
    function Controller() {
        this.model = new Model_1.Model();
    }
    Controller.prototype.className = function () {
        return "Controller";
    };
    return Controller;
}());
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map