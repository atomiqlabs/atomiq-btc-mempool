/// <reference types="node" />
/// <reference types="node" />
import { BtcBlock } from "@atomiqlabs/base";
import { Buffer } from "buffer";
export type MempoolBitcoinBlockType = {
    id: string;
    height: number;
    version: number;
    timestamp: number;
    tx_count: number;
    size: number;
    weight: number;
    merkle_root: string;
    previousblockhash: string;
    mediantime: number;
    nonce: number;
    bits: number;
    difficulty: number;
};
/**
 * Bitcoin block representation as fetched from mempool.space
 *
 * @category Bitcoin
 */
export declare class MempoolBitcoinBlock implements BtcBlock {
    id: string;
    height: number;
    version: number;
    timestamp: number;
    tx_count: number;
    size: number;
    weight: number;
    merkle_root: string;
    previousblockhash: string;
    mediantime: number;
    nonce: number;
    bits: number;
    difficulty: number;
    constructor(obj: MempoolBitcoinBlockType);
    /**
     * @inheritDoc
     */
    getHeight(): number;
    /**
     * @inheritDoc
     */
    getHash(): string;
    /**
     * @inheritDoc
     */
    getMerkleRoot(): string;
    /**
     * @inheritDoc
     */
    getNbits(): number;
    /**
     * @inheritDoc
     */
    getNonce(): number;
    /**
     * @inheritDoc
     */
    getPrevBlockhash(): string;
    /**
     * @inheritDoc
     */
    getTimestamp(): number;
    /**
     * @inheritDoc
     */
    getVersion(): number;
    /**
     * @inheritDoc
     *
     * Not supported with mempool.space backend!
     */
    getChainWork(): Buffer;
}
