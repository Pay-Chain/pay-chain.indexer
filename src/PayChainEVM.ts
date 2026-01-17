import { ponder } from "@/generated";

ponder.on("PayChain:PaymentCreated", async ({ event, context }) => {
    const { db } = context;

    await db.payments.create({
        id: event.args.paymentId.toString(),
        paymentId: event.args.paymentId,
        sender: event.args.sender,
        receiver: event.args.receiver,
        sourceChainId: `eip155:${context.network.chainId}`,
        destChainId: event.args.destChainId,
        sourceToken: event.args.sourceToken,
        destToken: event.args.destToken,
        amount: event.args.amount,
        fee: event.args.fee,
        status: "pending",
        bridgeType: event.args.bridgeType,
        sourceTxHash: event.transaction.hash,
        createdAt: BigInt(event.block.timestamp),
        updatedAt: BigInt(event.block.timestamp),
    });

    await db.paymentEvents.create({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        paymentId: event.args.paymentId.toString(),
        eventType: "CREATED",
        chain: "source",
        txHash: event.transaction.hash,
        blockNumber: BigInt(event.block.number),
        timestamp: BigInt(event.block.timestamp),
    });
});

ponder.on("PayChain:PaymentExecuted", async ({ event, context }) => {
    const { db } = context;

    await db.payments.update({
        id: event.args.paymentId.toString(),
        data: {
            status: "processing",
            updatedAt: BigInt(event.block.timestamp),
        },
    });

    await db.paymentEvents.create({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        paymentId: event.args.paymentId.toString(),
        eventType: "EXECUTED",
        chain: "source",
        txHash: event.transaction.hash,
        blockNumber: BigInt(event.block.number),
        timestamp: BigInt(event.block.timestamp),
    });
});

ponder.on("PayChain:PaymentCompleted", async ({ event, context }) => {
    const { db } = context;

    await db.payments.update({
        id: event.args.paymentId.toString(),
        data: {
            status: "completed",
            destTxHash: event.transaction.hash,
            updatedAt: BigInt(event.block.timestamp),
        },
    });

    await db.paymentEvents.create({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        paymentId: event.args.paymentId.toString(),
        eventType: "COMPLETED",
        chain: "destination",
        txHash: event.transaction.hash,
        blockNumber: BigInt(event.block.number),
        timestamp: BigInt(event.block.timestamp),
    });
});

ponder.on("PayChain:PaymentRefunded", async ({ event, context }) => {
    const { db } = context;

    await db.payments.update({
        id: event.args.paymentId.toString(),
        data: {
            status: "refunded",
            updatedAt: BigInt(event.block.timestamp),
        },
    });

    await db.paymentEvents.create({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        paymentId: event.args.paymentId.toString(),
        eventType: "REFUNDED",
        chain: "source",
        txHash: event.transaction.hash,
        blockNumber: BigInt(event.block.number),
        timestamp: BigInt(event.block.timestamp),
    });
});

ponder.on("PayChain:TokenSupportUpdated", async ({ event, context }) => {
    const { db } = context;
    const chainId = `eip155:${context.network.chainId}`;
    const id = `${chainId}-${event.args.token}`;

    await db.tokenSupport.upsert({
        id,
        create: {
            chainId,
            tokenAddress: event.args.token,
            supported: event.args.supported,
            updatedAt: BigInt(event.block.timestamp),
        },
        update: {
            supported: event.args.supported,
            updatedAt: BigInt(event.block.timestamp),
        },
    });
});
