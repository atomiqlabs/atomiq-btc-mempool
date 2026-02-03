/**
 * An error returned by the mempool api in a http response
 *
 * @category Errors
 */
export declare class MempoolApiError extends Error {
    httpCode: number;
    constructor(msg: string, httpCode: number);
}
