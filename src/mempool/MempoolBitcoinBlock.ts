import {BtcBlock} from "@atomiqlabs/base";
import {Buffer} from "buffer";

export type MempoolBitcoinBlockType = {
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
}

/**
 * Bitcoin block representation as fetched from mempool.space
 *
 * @category Bitcoin
 */
export class MempoolBitcoinBlock implements BtcBlock {

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

    constructor(obj: MempoolBitcoinBlockType) {
        this.id = obj.id;
        this.height = obj.height;
        this.version = obj.version;
        this.timestamp = obj.timestamp;
        this.tx_count = obj.tx_count;
        this.size = obj.size;
        this.weight = obj.weight;
        this.merkle_root = obj.merkle_root;
        this.previousblockhash = obj.previousblockhash;
        this.mediantime = obj.mediantime;
        this.nonce = obj.nonce;
        this.bits = obj.bits;
        this.difficulty = obj.difficulty;
    }

    /**
     * @inheritDoc
     */
    getHeight(): number {
        return this.height;
    }

    /**
     * @inheritDoc
     */
    getHash(): string {
        return this.id;
    }

    /**
     * @inheritDoc
     */
    getMerkleRoot(): string {
        return this.merkle_root;
    }

    /**
     * @inheritDoc
     */
    getNbits(): number {
        return this.bits;
    }

    /**
     * @inheritDoc
     */
    getNonce(): number {
        return this.nonce;
    }

    /**
     * @inheritDoc
     */
    getPrevBlockhash(): string {
        return this.previousblockhash;
    }

    /**
     * @inheritDoc
     */
    getTimestamp(): number {
        return this.timestamp;
    }

    /**
     * @inheritDoc
     */
    getVersion(): number {
        return this.version;
    }

    /**
     * @inheritDoc
     *
     * Not supported with mempool.space backend!
     */
    getChainWork(): Buffer {
        throw new Error("Unsupported");
    }

}