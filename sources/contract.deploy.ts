import * as fs from "fs";
import * as path from "path";
import { Address, contractAddress, toNano } from "@ton/core";
import { SampleJetton } from "./output/sample_SampleJetton";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

(async () => {

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

    // Load required data
    let address = contractAddress(0, init);
    let data = init.data.toBoc();
    let pkg = fs.readFileSync(path.resolve(__dirname, "output", packageName));

    // Prepareing
    console.log("Uploading package...");
    let prepare = await prepareTactDeployment({ pkg, data, testnet });

    // Deploying
    console.log("============================================================================================");
    console.log("Contract Address");
    console.log("============================================================================================");
    console.log();
    console.log(address.toString({ testOnly: testnet }));
    console.log();
    console.log("============================================================================================");
    console.log("Please, follow deployment link");
    console.log("============================================================================================");
    console.log();
    console.log(prepare);
    console.log();
    console.log("============================================================================================");
})();
