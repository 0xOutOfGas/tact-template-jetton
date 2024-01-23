import * as fs from "fs";
import * as path from "path";
import { Address, contractAddress, toNano, fromNano, internal } from "@ton/core";
import { TonClient4, WalletContractV4, beginCell, Cell } from "@ton/ton";
import { SampleJetton, Mint, storeTokenTransfer } from "./output/sample_SampleJetton";
import { buildOnchainMetadata } from "./utils/jetton-helpers";
import { mnemonicToPrivateKey } from "@ton/crypto";

const Sleep = (ms: number)=> {
    return new Promise(resolve=>setTimeout(resolve, ms))
}

(async () => {
    const client = new TonClient4({
        endpoint: "https://sandbox-v4.tonhubapi.com", // 🔴 Test-net API endpoint
    });

    // open wallet v4 (notice the correct wallet version here)
    const mnemonic = "excite tenant track brief card travel picture company suggest shed usage wire evolve advice lady inform key regular hockey pride health corn dish trigger"; // your 24 secret words (replace ... with the rest of the words)
    const key = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    
    // open wallet and read the current seqno of the wallet
    const walletContract = client.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);


    const jettonParams = {
        name: "Token Name",
        description: "This is description of Test Jetton Token in Tact-lang",
        symbol: "TNT",
        image: "https://avatars.githubusercontent.com/u/104382459?s=200&v=4",
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);
    let max_supply = toNano(123456766689011); // 🔴 Set the specific total supply in nano

    // Parameters
    let testnet = true;
    let packageName = "sample_SampleJetton.pkg";
    let owner = Address.parse("0QD8d5vx-7hiviuMMCU_xXHyg9PToCHgQB1MwcTkgG7dIbkt");
    let init = await SampleJetton.init(owner, content, max_supply);
    
    // open the contract address
    let contract_address = contractAddress(0, init);
    let contract = await SampleJetton.fromAddress(contract_address);
    let contract_open = await client.open(contract);

    // send "Mint: 100" message to contract
    await contract_open.send(walletSender, { value: toNano(1) }, "Mint: 100");
    // await contract_open.send(walletSender, { value: toNano(1) },  {
    //     $$type: 'Mint',
    //     amount: 1001n,
    //     receiver: walletSender.address as Address
    // });
    
    // await Sleep(5000);


    // // send Transfer message to contract
    // let jetton_wallet = await contract_open.getGetWalletAddress(walletContract.address);
    // console.log("✨ " + walletContract.address + "'s JettonWallet ==> ");

    // // ✨Pack the forward message into a cell
    // const test_message_left = beginCell()
    //     .storeBit(0) // 🔴  whether you want to store the forward payload in the same cell or not. 0 means no, 1 means yes.
    //     .storeUint(0, 32)
    //     .storeBuffer(Buffer.from("Hello, GM -- Left.", "utf-8"))
    //     .endCell();

    // let NewOnwer_Address = Address.parse("0QD8d5vx-7hiviuMMCU_xXHyg9PToCHgQB1MwcTkgG7dIbkt"); // 🔴 Owner should usually be the deploying wallet's address.
    // // ========================================
    // let forward_string_test = beginCell().storeBit(1).storeUint(0, 32).storeStringTail("EEEEEE").endCell();
    // let packed = beginCell()
    //     .store(
    //         storeTokenTransfer({
    //             $$type: "TokenTransfer",
    //             query_id: 0n,
    //             amount: toNano(20000),
    //             destination: NewOnwer_Address,
    //             response_destination: walletContract.address, // Original Owner, aka. First Minter's Jetton Wallet
    //             custom_payload: forward_string_test,
    //             forward_ton_amount: toNano("0.000000001"),
    //             forward_payload: test_message_left,
    //         })
    //     )
    //     .endCell();

    // let deployAmount = toNano("0.3");
    // let seqno: number = await walletContract.getSeqno();
    // let balance: bigint = await walletContract.getBalance();
    // // ========================================
    // //printSeparator();
    // console.log("Current deployment wallet balance: ", fromNano(balance).toString(), "💎TON");
    // console.log("\n🛠️ Calling To JettonWallet:\n" + jetton_wallet + "\n");
    // await walletContract.sendTransfer({
    //     seqno,
    //     secretKey: key.secretKey,
    //     messages: [
    //         internal({
    //             to: jetton_wallet,
    //             value: deployAmount,
    //             init: {
    //                 code: init.code,
    //                 data: init.data,
    //             },
    //             bounce: true,
    //             body: packed,
    //         }),
    //     ],
    // });
})();
