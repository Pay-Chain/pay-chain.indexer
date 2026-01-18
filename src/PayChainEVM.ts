import { ponder } from "@/generated";

// Helper to notify backend (webhook)
async function notifyBackend(eventType: string, data: any) {
    const WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL;
    if (!WEBHOOK_URL) return;

    try {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventType, data, timestamp: new Date().toISOString() }),
        });
    } catch (error) {
        console.error("Failed to notify backend:", error);
    }
}

// Payment handlers (shared logic)
async function handlePaymentCreated({ event, context }: any) {
    const { db } = context;
    const payment = await db.payments.create({
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

    await notifyBackend("PAYMENT_CREATED", payment);
}

async function handlePaymentExecuted({ event, context }: any) {
    const { db } = context;
    const payment = await db.payments.update({
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

    await notifyBackend("PAYMENT_EXECUTED", payment);
}

async function handlePaymentCompleted({ event, context }: any) {
    const { db } = context;
    const payment = await db.payments.update({
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

    await notifyBackend("PAYMENT_COMPLETED", payment);
}

async function handlePaymentRefunded({ event, context }: any) {
    const { db } = context;
    const payment = await db.payments.update({
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

    await notifyBackend("PAYMENT_REFUNDED", payment);
}

// Payment Request handlers
async function handlePaymentRequestCreated({ event, context }: any) {
    const { db } = context;
    const request = await db.paymentRequests.create({
        id: event.args.requestId.toString(),
        merchant: event.args.merchant,
        receiver: event.args.receiver,
        token: event.args.token,
        amount: event.args.amount,
        expiresAt: event.args.expiresAt,
        isPaid: false,
        txHash: event.transaction.hash,
        createdAt: BigInt(event.block.timestamp),
        updatedAt: BigInt(event.block.timestamp),
    });

    await notifyBackend("PAYMENT_REQUEST_CREATED", request);
}

async function handleRequestPaymentReceived({ event, context }: any) {
    const { db } = context;
    const request = await db.paymentRequests.update({
        id: event.args.requestId.toString(),
        data: {
            isPaid: true,
            payer: event.args.payer,
            updatedAt: BigInt(event.block.timestamp),
        },
    });

    await notifyBackend("REQUEST_PAYMENT_RECEIVED", request);
}

// Bind handlers to both contracts
const supportedContracts = ["PayChainCCIP", "PayChainHyperbridge"] as const;

supportedContracts.forEach((contractName: any) => {
    ponder.on(`${contractName}:PaymentCreated`, handlePaymentCreated);
    ponder.on(`${contractName}:PaymentExecuted`, handlePaymentExecuted);
    ponder.on(`${contractName}:PaymentCompleted`, handlePaymentCompleted);
    ponder.on(`${contractName}:PaymentRefunded`, handlePaymentRefunded);
    ponder.on(`${contractName}:PaymentRequestCreated`, handlePaymentRequestCreated);
    ponder.on(`${contractName}:RequestPaymentReceived`, handleRequestPaymentReceived);

    ponder.on(`${contractName}:TokenSupportUpdated`, async ({ event, context }) => {
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
});
