export const PayChainAbi = [
    {
        type: "event",
        name: "PaymentCreated",
        inputs: [
            { name: "paymentId", type: "bytes32", indexed: true },
            { name: "sender", type: "address", indexed: true },
            { name: "receiver", type: "address", indexed: true },
            { name: "destChainId", type: "string", indexed: false },
            { name: "sourceToken", type: "address", indexed: false },
            { name: "destToken", type: "address", indexed: false },
            { name: "amount", type: "uint256", indexed: false },
            { name: "fee", type: "uint256", indexed: false },
            { name: "bridgeType", type: "string", indexed: false },
        ],
    },
    {
        type: "event",
        name: "PaymentExecuted",
        inputs: [
            { name: "paymentId", type: "bytes32", indexed: true },
            { name: "ccipMessageId", type: "bytes32", indexed: false },
        ],
    },
    {
        type: "event",
        name: "PaymentCompleted",
        inputs: [
            { name: "paymentId", type: "bytes32", indexed: true },
            { name: "destAmount", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "PaymentRefunded",
        inputs: [
            { name: "paymentId", type: "bytes32", indexed: true },
            { name: "refundAmount", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "TokenSupportUpdated",
        inputs: [
            { name: "token", type: "address", indexed: false },
            { name: "supported", type: "bool", indexed: false },
        ],
    },
    {
        type: "event",
        name: "ChainSupportUpdated",
        inputs: [
            { name: "chainId", type: "string", indexed: false },
            { name: "supported", type: "bool", indexed: false },
        ],
    },
] as const;
