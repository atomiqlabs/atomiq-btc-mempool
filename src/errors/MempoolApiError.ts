
/**
 * An error returned by the mempool api in a http response
 *
 * @category Errors
 */
export class MempoolApiError extends Error {

  httpCode: number;
  responseMessage: string;

  constructor(msg: string, httpCode: number) {
    super(`MempoolApiError(${httpCode}): `+msg);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MempoolApiError.prototype);
    this.httpCode = httpCode;
    this.responseMessage = msg;
  }

}
