"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MempoolApiError = void 0;
/**
 * An error returned by the mempool api in a http response
 *
 * @category Errors
 */
class MempoolApiError extends Error {
    constructor(msg, httpCode) {
        super(`MempoolApiError(${httpCode}): ` + msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, MempoolApiError.prototype);
        this.httpCode = httpCode;
    }
}
exports.MempoolApiError = MempoolApiError;
