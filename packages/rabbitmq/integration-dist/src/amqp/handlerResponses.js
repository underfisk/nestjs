"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Nack {
    constructor(_requeue = false) {
        this._requeue = _requeue;
    }
    get requeue() {
        return this._requeue;
    }
}
exports.Nack = Nack;
//# sourceMappingURL=handlerResponses.js.map