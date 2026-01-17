import { onchainTable } from "@ponder/core";

export const payments = onchainTable("payments", (t) => ({
    id: t.text().primaryKey(),
    paymentId: t.hex().notNull(),
    sender: t.hex().notNull(),
    receiver: t.hex().notNull(),
    sourceChainId: t.text().notNull(),
    destChainId: t.text().notNull(),
    sourceToken: t.hex().notNull(),
    destToken: t.hex().notNull(),
    amount: t.bigint().notNull(),
    fee: t.bigint().notNull(),
    status: t.text().notNull(),
    bridgeType: t.text(),
    sourceTxHash: t.hex(),
    destTxHash: t.hex(),
    createdAt: t.bigint().notNull(),
    updatedAt: t.bigint().notNull(),
}));

export const paymentEvents = onchainTable("payment_events", (t) => ({
    id: t.text().primaryKey(),
    paymentId: t.text().notNull(),
    eventType: t.text().notNull(),
    chain: t.text().notNull(),
    txHash: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
}));

export const tokenSupport = onchainTable("token_support", (t) => ({
    id: t.text().primaryKey(),
    chainId: t.text().notNull(),
    tokenAddress: t.hex().notNull(),
    supported: t.boolean().notNull(),
    updatedAt: t.bigint().notNull(),
}));
