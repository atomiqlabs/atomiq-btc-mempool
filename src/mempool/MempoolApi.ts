import {Buffer} from "buffer";
import {MempoolApiError} from "../errors/MempoolApiError";
import {BitcoinNetwork, tryWithRetries} from "@atomiqlabs/base";

/**
 * Bitcoin transaction confirmation status
 */
export type BitcoinTransactionStatus = {
    confirmed: boolean,
    block_height: number,
    block_hash: string,
    block_time: number
};

/**
 * Bitcoin transaction output
 */
export type TxVout = {
    scriptpubkey: string,
    scriptpubkey_asm: string,
    scriptpubkey_type: string,
    scriptpubkey_address: string,
    value: number
};

/**
 * Bitcoin transaction input
 */
export type TxVin = {
    txid: string,
    vout: number,
    prevout: TxVout,
    scriptsig: string,
    scriptsig_asm: string,
    witness: string[],
    is_coinbase: boolean,
    sequence: number,
    inner_witnessscript_asm: string
};

/**
 * Full Bitcoin transaction data
 */
export type BitcoinTransaction = {
    txid: string,
    version: number,
    locktime: number,
    vin: TxVin[],
    vout: TxVout[],
    size: number,
    weight: number,
    fee: number,
    status: BitcoinTransactionStatus
};

/**
 * Bitcoin block data
 */
export type BlockData = {
    bits: number,
    difficulty: number,
    extras: any,
    height: number,
    id: string,
    mediantime: number,
    merkle_root: string,
    nonce: number,
    previousblockhash: string,
    size: number,
    timestamp: number,
    tx_count: number,
    version: number,
    weight: number
}

/**
 * Bitcoin block header data
 */
export type BitcoinBlockHeader = {
    id: string,
    height: number,
    version: number,
    timestamp: number,
    tx_count: number,
    size: number,
    weight: number,
    merkle_root: string,
    previousblockhash: string,
    mediantime: number,
    nonce: number,
    bits: number,
    difficulty: number
};

/**
 * Lightning network node info
 */
export type LNNodeInfo = {
    public_key: string,
    alias: string,
    first_seen: number,
    updated_at: number,
    color: string,
    sockets: string,
    as_number: number,
    city_id: number,
    country_id: number,
    subdivision_id: number,
    longtitude: number,
    latitude: number,
    iso_code: string,
    as_organization: string,
    city: {[lang: string]: string},
    country: {[lang: string]: string},
    subdivision: {[lang: string]: string},
    active_channel_count: number,
    capacity: string,
    opened_channel_count: number,
    closed_channel_count: number
};

/**
 * Address information as returned from the mempool api
 */
export type AddressInfo = {
    address: string;
    chain_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
    mempool_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
};

/**
 * Transaction CPFP data response as returned from the mempool.space API
 */
export type TransactionCPFPData = {
    ancestors: {
        txid: string,
        fee: number,
        weight: number
    }[],
    descendants: {
        txid: string,
        fee: number,
        weight: number
    }[],
    effectiveFeePerVsize: number,
    sigops: number,
    adjustedVsize: number
};

/**
 * Bitcoin fees data response as returned from the mempool.space API
 */
export type BitcoinFees = {
    fastestFee: number,
    halfHourFee: number,
    hourFee: number,
    economyFee: number,
    minimumFee: number
};

/**
 * Pending (predicted next block based on the current mempool) block data response as returned from the mempool.space API
 */
export type BitcoinPendingBlock = {
    blockSize: number,
    blockVSize: number,
    nTx: number,
    totalFees: number,
    medianFee: number,
    feeRange: number[]
};

/**
 * Block status as returned from the mempool.space API
 */
export type BlockStatus = {
    in_best_chain: boolean,
    height: number,
    next_best: string
};

/**
 * Transaction merkle proof as returned by the mempool.space API
 */
export type TransactionProof = {
    block_height: number,
    merkle: string[],
    pos: number
};

/**
 * Transaction output spend as returned by the mempool.space API
 */
export type TransactionOutspend = {
    spent: boolean,
    txid: string,
    vin: number,
    status: BitcoinTransactionStatus
};

const MempoolApiEndpoints: {[network in BitcoinNetwork]?: string[]} = {
    [BitcoinNetwork.MAINNET]: [
        "https://mempool.space/api/",
        "https://mempool.fra.mempool.space/api/",
        "https://mempool.va1.mempool.space/api/",
        "https://mempool.tk7.mempool.space/api/"
    ],
    [BitcoinNetwork.TESTNET]: [
        "https://mempool.space/testnet/api/",
        "https://mempool.fra.mempool.space/testnet/api/",
        "https://mempool.va1.mempool.space/testnet/api/",
        "https://mempool.tk7.mempool.space/testnet/api/"
    ],
    [BitcoinNetwork.TESTNET4]: [
        "https://mempool.space/testnet4/api/",
        "https://mempool.fra.mempool.space/testnet4/api/",
        "https://mempool.va1.mempool.space/testnet4/api/",
        "https://mempool.tk7.mempool.space/testnet4/api/"
    ]
}

/**
 * Mempool.space REST API client for Bitcoin blockchain data
 *
 * @category Bitcoin
 */
export class MempoolApi {

    backends: {
        url: string,
        operational: boolean | null
    }[];
    timeout: number;

    /**
     * Returns api url that should be operational
     *
     * @private
     */
    private getOperationalApi(): {url: string, operational: boolean | null} | undefined {
        return this.backends.find(e => e.operational===true);
    }

    /**
     * Returns api urls that are maybe operational, in case none is considered operational returns all of the price
     *  apis such that they can be tested again whether they are operational
     *
     * @private
     */
    private getMaybeOperationalApis(): {url: string, operational: boolean | null}[] {
        let operational = this.backends.filter(e => e.operational===true || e.operational===null);
        if(operational.length===0) {
            this.backends.forEach(e => e.operational=null);
            operational = this.backends;
        }
        return operational;
    }

    /**
     * Sends a GET or POST request to the mempool api, handling the non-200 responses as errors & throwing
     *
     * @param url
     * @param path
     * @param responseType
     * @param type
     * @param body
     */
    private async _request<T>(
        url: string,
        path: string,
        responseType: T extends string ? "str" : "obj",
        type: "GET" | "POST" = "GET",
        body?: string | any
    ) : Promise<T> {
        const response: Response = await fetch(url+path, {
            method: type,
            signal: AbortSignal.timeout(this.timeout),
            body: typeof(body)==="string" ? body : JSON.stringify(body)
        });

        if(response.status!==200) {
            let resp: string;
            try {
                resp = await response.text();
            } catch (e) {
                throw new MempoolApiError(response.statusText, response.status);
            }
            throw new MempoolApiError(resp, response.status);
        }

        if(responseType==="str") return await response.text() as any;
        return await response.json();
    }

    /**
     * Sends request in parallel to multiple maybe operational api urls
     *
     * @param path
     * @param responseType
     * @param type
     * @param body
     * @private
     */
    private async requestFromMaybeOperationalUrls<T>(
        path: string,
        responseType: T extends string ? "str" : "obj",
        type: "GET" | "POST" = "GET",
        body?: string | any
    ) : Promise<T> {
        try {
            return await Promise.any<T>(this.getMaybeOperationalApis().map(
                obj => (async () => {
                    try {
                        const result = await this._request<T>(obj.url, path, responseType, type, body);
                        obj.operational = true;
                        return result;
                    } catch (e) {
                        //Only mark as non operational on 5xx server errors!
                        if(e instanceof MempoolApiError && Math.floor(e.httpCode/100)!==5) {
                            obj.operational = true;
                            throw e;
                        } else {
                            obj.operational = false;
                            throw e;
                        }
                    }
                })()
            ))
        } catch (_e: any) {
            const e = _e as AggregateError;
            throw e.errors.find(err => err instanceof MempoolApiError && Math.floor(err.httpCode/100)!==5) || e.errors[0];
        }
    }

    /**
     * Sends a request to mempool API, first tries to use the operational API (if any) and if that fails it falls back
     *  to using maybe operational price APIs
     *
     * @param path
     * @param responseType
     * @param type
     * @param body
     * @private
     */
    private async request<T>(
        path: string,
        responseType: T extends string ? "str" : "obj",
        type: "GET" | "POST" = "GET",
        body?: string | any
    ) : Promise<T> {
        return tryWithRetries<T>(() => {
            const operationalPriceApi = this.getOperationalApi();
            if(operationalPriceApi!=null) {
                return this._request(operationalPriceApi.url, path, responseType, type, body).catch(err => {
                    //Only retry on 5xx server errors!
                    if(err instanceof MempoolApiError && Math.floor(err.httpCode/100)!==5) throw err;
                    operationalPriceApi.operational = false;
                    return this.requestFromMaybeOperationalUrls(path, responseType, type, body);
                });
            }
            return this.requestFromMaybeOperationalUrls(path, responseType, type, body);
        }, undefined, (err: any) => err instanceof MempoolApiError && Math.floor(err.httpCode/100)!==5);
    }

    constructor(network: BitcoinNetwork, timeout?: number);
    constructor(url: string | string[], timeout?: number);
    constructor(urlOrNetwork: BitcoinNetwork | string | string[], timeout?: number) {
        if(typeof(urlOrNetwork)==="number") {
            const endpoints = MempoolApiEndpoints[urlOrNetwork];
            if(endpoints==null)
                throw new Error(`No default endpoints found for ${BitcoinNetwork[urlOrNetwork]} network, please pass the manually as string or string[]`);
            this.backends = endpoints.map(val => ({url: val, operational: null}))
        } else {
            if(Array.isArray(urlOrNetwork)) {
                this.backends = urlOrNetwork.map(val => ({url: val, operational: null}));
            } else {
                this.backends = [{url: urlOrNetwork, operational: null}];
            }
        }
        this.timeout = timeout ?? 15*1000;
    }

    /**
     * Returns information about a specific lightning network node as identified by the public key (in hex encoding)
     *
     * @param pubkey
     */
    getLNNodeInfo(pubkey: string): Promise<LNNodeInfo | null> {
        //500, 200
        return this.request<LNNodeInfo>("v1/lightning/nodes/"+pubkey, "obj").catch((e: MempoolApiError) => {
            if(e.responseMessage==="This node does not exist, or our node is not seeing it yet") return null;
            throw e;
        });
    }

    /**
     * Returns on-chain transaction as identified by its txId
     *
     * @param txId
     */
    getTransaction(txId: string): Promise<BitcoinTransaction | null> {
        //404 ("Transaction not found"), 200
        return this.request<BitcoinTransaction>("tx/"+txId, "obj").catch((e: MempoolApiError) => {
            if(e.responseMessage==="Transaction not found") return null;
            throw e;
        });
    }

    /**
     * Returns raw binary encoded bitcoin transaction, also strips the witness data from the transaction
     *
     * @param txId
     */
    async getRawTransaction(txId: string): Promise<Buffer | null> {
        //404 ("Transaction not found"), 200
        const rawTransaction: string | null = await this.request<string>("tx/"+txId+"/hex", "str").catch((e: MempoolApiError) => {
            if(e.responseMessage==="Transaction not found") return null;
            throw e;
        });
        return rawTransaction==null ? null : Buffer.from(rawTransaction, "hex")
    }

    /**
     * Returns confirmed & unconfirmed balance of the specific bitcoin address
     *
     * @param address
     */
    async getAddressBalances(address: string): Promise<{
        confirmedBalance: bigint,
        unconfirmedBalance: bigint
    }> {
        //400 ("Invalid Bitcoin address"), 200
        const jsonBody = await this.request<AddressInfo>("address/"+address, "obj");

        const confirmedInput = BigInt(jsonBody.chain_stats.funded_txo_sum);
        const confirmedOutput = BigInt(jsonBody.chain_stats.spent_txo_sum);
        const unconfirmedInput = BigInt(jsonBody.mempool_stats.funded_txo_sum);
        const unconfirmedOutput = BigInt(jsonBody.mempool_stats.spent_txo_sum);

        return {
            confirmedBalance: confirmedInput - confirmedOutput,
            unconfirmedBalance: unconfirmedInput - unconfirmedOutput
        }
    }

    /**
     * Returns CPFP (children pays for parent) data for a given transaction
     *
     * @param txId
     */
    getCPFPData(txId: string): Promise<TransactionCPFPData> {
        //200
        return this.request<TransactionCPFPData>("v1/cpfp/"+txId, "obj");
    }

    /**
     * Returns UTXOs (unspent transaction outputs) for a given address
     *
     * @param address
     */
    async getAddressUTXOs(address: string): Promise<{
        txid: string,
        vout: number,
        status: {
            confirmed: boolean,
            block_height: number,
            block_hash: string,
            block_time: number
        },
        value: bigint
    }[]> {
        //400 ("Invalid Bitcoin address"), 200
        let jsonBody = await this.request<any[]>("address/"+address+"/utxo", "obj");
        jsonBody.forEach(e => e.value = BigInt(e.value));

        return jsonBody;
    }

    /**
     * Returns current on-chain bitcoin fees
     */
    getFees(): Promise<BitcoinFees> {
        //200
        return this.request<BitcoinFees>("v1/fees/recommended", "obj");
    }

    /**
     * Returns all transactions for a given address
     *
     * @param address
     */
    getAddressTransactions(address: string): Promise<BitcoinTransaction[]> {
        //400 ("Invalid Bitcoin address"), 200
        return this.request<BitcoinTransaction[]>("address/"+address+"/txs", "obj");
    }

    /**
     * Returns expected pending (mempool) blocks
     */
    getPendingBlocks(): Promise<BitcoinPendingBlock[]> {
        //200
        return this.request<BitcoinPendingBlock[]>("v1/fees/mempool-blocks", "obj");
    }

    /**
     * Returns the blockheight of the current bitcoin blockchain's tip
     */
    async getTipBlockHeight() : Promise<number> {
        //200
        const response: string = await this.request<string>("blocks/tip/height", "str");
        return parseInt(response);
    }

    /**
     * Returns the bitcoin blockheader as identified by its blockhash
     *
     * @param blockhash
     */
    getBlockHeader(blockhash: string): Promise<BitcoinBlockHeader> {
        //404 ("Block not found"), 200
        return this.request<BitcoinBlockHeader>("block/"+blockhash, "obj");
    }

    /**
     * Returns the block status
     *
     * @param blockhash
     */
    getBlockStatus(blockhash: string): Promise<BlockStatus> {
        //200
        return this.request<BlockStatus>("block/"+blockhash+"/status", "obj");
    }

    /**
     * Returns the transaction's proof (merkle proof)
     *
     * @param txId
     */
    getTransactionProof(txId: string) : Promise<TransactionProof> {
        //404 ("Transaction not found or is unconfirmed"), 200
        return this.request<TransactionProof>("tx/"+txId+"/merkle-proof", "obj");
    }

    /**
     * Returns the transaction's proof (merkle proof)
     *
     * @param txId
     */
    getOutspends(txId: string) : Promise<TransactionOutspend[]> {
        //404 ("Transaction not found"), 200
        return this.request<TransactionOutspend[]>("tx/"+txId+"/outspends", "obj");
    }

    /**
     * Returns blockhash of a block at a specific blockheight
     *
     * @param height
     */
    getBlockHash(height: number): Promise<string> {
        //404 ("Block not found"), 200
        return this.request<string>("block-height/"+height, "str");
    }

    /**
     * Returns past 15 blockheaders before (and including) the specified height
     *
     * @param endHeight
     */
    getPast15BlockHeaders(endHeight: number) : Promise<BlockData[]> {
        //200
        return this.request<BlockData[]>("v1/blocks/"+endHeight, "obj");
    }

    /**
     * Sends raw hex encoded bitcoin transaction
     *
     * @param transactionHex
     */
    sendTransaction(transactionHex: string): Promise<string> {
        //400??, 200
        return this.request<string>("tx", "str", "POST", transactionHex);
    }

}
