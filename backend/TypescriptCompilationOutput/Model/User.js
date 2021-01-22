"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var User = /** @class */ (function () {
    function User(email, admin, passwordUnsafeVar, projects) {
        this.email = email;
        this.admin = admin;
        this.passwordUnsafeVar = passwordUnsafeVar;
        this.projects = projects;
    }
    //Write test
    User.prototype.getMail = function () {
        return this.email;
    };
    //Write test (method is not complete)
    User.prototype.setMail = function (email) {
        this.email = email;
    };
    return User;
}());
exports.User = User;
//# sourceMappingURL=User.js.map