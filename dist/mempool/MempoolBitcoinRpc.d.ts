/// <reference types="node" />
/// <reference types="node" />
import { BitcoinNetwork, BitcoinRpcWithAddressIndex, BtcBlockWithTxs, BtcSyncInfo, BtcTx, BtcTxWithBlockheight, LightningNetworkApi, LNNodeLiquidity } from "@atomiqlabs/base";
import { MempoolBitcoinBlock } from "./MempoolBitcoinBlock";
import { MempoolApi } from "./MempoolApi";
import { Buffer } from "buffer";
import { BTC_NETWORK } from "@scure/btc-signer/utils";
/**
 * Bitcoin RPC implementation via Mempool.space API
 *
 * @category Bitcoin
 */
export declare class MempoolBitcoinRpc implements BitcoinRpcWithAddressIndex<MempoolBitcoinBlock>, LightningNetworkApi {
    api: MempoolApi;
    network: BTC_NETWORK;
    constructor(urlOrMempoolApi: MempoolApi | string | string[], network?: BitcoinNetwork);
    /**
     * Returns a txo hash for a specific transaction vout
     *
     * @param vout
     * @private
     */
    private static getTxoHash;
    /**
     * Returns delay in milliseconds till an unconfirmed transaction is expected to confirm, returns -1
     *  if the transaction won't confirm any time soon
     *
     * @param feeRate
     * @private
     */
    private getTimeTillConfirmation;
    /**
     * @inheritDoc
     */
    getConfirmationDelay(tx: {
        txid: string;
        confirmations?: number;
    }, requiredConfirmations: number): Promise<number | null>;
    /**
     * Converts mempool API's transaction to BtcTx object while fetching the raw tx separately
     * @param tx Transaction to convert
     * @private
     */
    private toBtcTx;
    /**
     * Converts mempool API's transaction to BtcTx object, doesn't populate raw and hex fields
     * @param tx Transaction to convert
     * @private
     */
    private toBtcTxWithoutRawData;
    /**
     * @inheritDoc
     */
    getTipHeight(): Promise<number>;
    /**
     * @inheritDoc
     */
    getBlockHeader(blockhash: string): Promise<MempoolBitcoinBlock>;
    /**
     * @inheritDoc
     */
    getMerkleProof(txId: string, blockhash: string): Promise<{
        reversedTxId: Buffer;
        pos: number;
        merkle: Buffer[];
        blockheight: number;
    }>;
    /**
     * @inheritDoc
     */
    getTransaction(txId: string): Promise<BtcTxWithBlockheight | null>;
    /**
     * @inheritDoc
     */
    isInMainChain(blockhash: string): Promise<boolean>;
    /**
     * @inheritDoc
     */
    getBlockhash(height: number): Promise<string>;
    /**
     * @inheritDoc
     */
    getBlockWithTransactions(blockhash: string): Promise<BtcBlockWithTxs>;
    /**
     * @inheritDoc
     */
    getSyncInfo(): Promise<BtcSyncInfo>;
    /**
     * @private
     */
    getPast15Blocks(height: number): Promise<MempoolBitcoinBlock[]>;
    /**
     * @inheritDoc
     */
    checkAddressTxos(address: string, txoHash: Buffer): Promise<{
        tx: Omit<BtcTxWithBlockheight, "hex" | "raw">;
        vout: number;
    } | null>;
    /**
     * @inheritDoc
     */
    waitForAddressTxo(address: string, txoHash: Buffer, requiredConfirmations: number, stateUpdateCbk: (btcTx?: Omit<BtcTxWithBlockheight, "hex" | "raw">, vout?: number, txEtaMS?: number) => void, abortSignal?: AbortSignal, intervalSeconds?: number): Promise<{
        tx: Omit<BtcTxWithBlockheight, "hex" | "raw">;
        vout: number;
    }>;
    /**
     * @inheritDoc
     */
    waitForTransaction(txId: string, requiredConfirmations: number, stateUpdateCbk: (btcTx?: BtcTxWithBlockheight, txEtaMS?: number) => void, abortSignal?: AbortSignal, intervalSeconds?: number): Promise<BtcTxWithBlockheight>;
    /**
     * @inheritDoc
     */
    getLNNodeLiquidity(pubkey: string): Promise<LNNodeLiquidity | null>;
    /**
     * @inheritDoc
     */
    sendRawTransaction(rawTx: string): Promise<string>;
    /**
     * @inheritDoc
     */
    sendRawPackage(rawTx: string[]): Promise<string[]>;
    /**
     * @inheritDoc
     */
    isSpent(utxo: string, confirmed?: boolean): Promise<boolean>;
    /**
     * @inheritDoc
     */
    parseTransaction(rawTx: string): Promise<BtcTx>;
    /**
     * @inheritDoc
     */
    getEffectiveFeeRate(btcTx: BtcTx): Promise<{
        vsize: number;
        fee: number;
        feeRate: number;
    }>;
    /**
     * @inheritDoc
     */
    getFeeRate(): Promise<number>;
    /**
     * @inheritDoc
     */
    getAddressBalances(address: string): Promise<{
        confirmedBalance: bigint;
        unconfirmedBalance: bigint;
    }>;
    /**
     * @inheritDoc
     */
    getAddressUTXOs(address: string): Promise<{
        txid: string;
        vout: number;
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
        value: bigint;
    }[]>;
    /**
     * @inheritDoc
     */
    getCPFPData(txId: string): Promise<{
        effectiveFeePerVsize: number;
        adjustedVsize: number;
    } | null>;
    /**
     * @inheritDoc
     */
    outputScriptToAddress(outputScriptHex: string): Promise<string>;
}
