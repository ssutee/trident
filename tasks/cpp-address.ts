import { ChainId, USDC_ADDRESS, WETH9_ADDRESS, WNATIVE_ADDRESS } from "@sushiswap/core-sdk";
import { task, types } from "hardhat/config";

task("cpp-address", "Constant Product Pool deploy")
  .addOptionalParam("token0", "Token A", WNATIVE_ADDRESS[ChainId.MATIC], types.string)
  .addOptionalParam("token1", "Token B", USDC_ADDRESS[ChainId.MATIC], types.string)
  .addOptionalParam("fee", "Fee tier", 30, types.int)
  .addOptionalParam("twap", "Twap enabled", true, types.boolean)
  .setAction(async ({ token0, token1, fee, twap }, { ethers }): Promise<string> => {
    const master = (await ethers.getContract("MasterDeployer")).address;
    const factory = (await ethers.getContract("ConstantProductPoolFactory")).address;
    const deployData = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256", "bool"],
      [...[token0, token1].sort(), fee, twap]
    );
    const salt = ethers.utils.keccak256(deployData);
    // const constructorParams = ethers.utils.defaultAbiCoder
    //   .encode(["bytes", "address"], [deployData, master])
    //   .substring(2);
    const Pool = await ethers.getContractFactory("ConstantProductPool");
    const initCodeHash = ethers.utils.keccak256(Pool.bytecode);
    const address = ethers.utils.getCreate2Address(factory, salt, initCodeHash);
    console.log(address, [...[token0, token1].sort(), fee, twap]);
    return address;
  });
