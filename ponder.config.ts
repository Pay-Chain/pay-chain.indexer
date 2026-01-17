import { createConfig } from "@ponder/core";
import { http } from "viem";

import { PayChainAbi } from "./abis/PayChainAbi";

export default createConfig({
    networks: {
        baseSepolia: {
            chainId: 84532,
            transport: http(process.env.PONDER_RPC_URL_84532),
        },
        bscSepolia: {
            chainId: 97,
            transport: http(process.env.PONDER_RPC_URL_97),
        },
    },
    contracts: {
        PayChain: {
            network: {
                baseSepolia: {
                    address: "0x0000000000000000000000000000000000000000", // TODO: Update after deployment
                    startBlock: 0,
                },
                bscSepolia: {
                    address: "0x0000000000000000000000000000000000000000", // TODO: Update after deployment
                    startBlock: 0,
                },
            },
            abi: PayChainAbi,
        },
    },
});
