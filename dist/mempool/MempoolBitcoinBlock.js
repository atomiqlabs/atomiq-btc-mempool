"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MempoolBitcoinBlock = void 0;
/**
 * Bitcoin block representation as fetched from mempool.space
 *
 * @category Bitcoin
 */
class MempoolBitcoinBlock {
    constructor(obj) {
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
    getHeight() {
        return this.height;
    }
    /**
     * @inheritDoc
     */
    getHash() {
        return this.id;
    }
    /**
     * @inheritDoc
     */
    getMerkleRoot() {
        return this.merkle_root;
    }
    /**
     * @inheritDoc
     */
    getNbits() {
        return this.bits;
    }
    /**
     * @inheritDoc
     */
    getNonce() {
        return this.nonce;
    }
    /**
     * @inheritDoc
     */
    getPrevBlockhash() {
        return this.previousblockhash;
    }
    /**
     * @inheritDoc
     */
    getTimestamp() {
        return this.timestamp;
    }
    /**
     * @inheritDoc
     */
    getVersion() {
        return this.version;
    }
    /**
     * @inheritDoc
     *
     * Not supported with mempool.space backend!
     */
    getChainWork() {
        throw new Error("Unsupported");
    }
}
exports.MempoolBitcoinBlock = MempoolBitcoinBlock;
