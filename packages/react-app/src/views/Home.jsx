import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ readContracts, writeContracts, signer, provider, network }) {
  // @author: Jesper; AN EXAMPLE OF HOW TO IMPLEMENT EIP712
  
  // put the contract address here (needs to be updated when the contract changes)
  const contractAddr = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";

  const getAllowance = async () => {
    const myAccount = await signer.getAddress();

    let allowance = (await readContracts.YourContract.allowance(myAccount, contractAddr)).toNumber();
    console.log("CURRENT ALLOWANCE", allowance);
  }

  const signData = async () => {
    const myAccount = await signer.getAddress();
    const amount = 1000;
    const deadline = +new Date() + 60 * 60;
    console.log("deadline: " + deadline);

    console.log("chain Id:", network.chainId);

    const nonce = (await readContracts.YourContract.nonces(myAccount)).toNumber();
    console.log("nonce:", nonce);

    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ],
      },
      primaryType: "Permit",
      domain: {
        name: "Jesper",
        version: "1",
        chainId: network.chainId,
        verifyingContract: contractAddr
      },
      message: {
        owner: myAccount,
        spender: contractAddr,
        value: amount,
        nonce: nonce,
        deadline: deadline
      }
    };

    let signature = await signer.provider.send("eth_signTypedData_v4",
      [myAccount, JSON.stringify(typedData)]
    );
    const split = ethers.utils.splitSignature(signature);

    console.log("r: ", split.r);
    console.log("s: ", split.s);
    console.log("v: ", split.v);

    let allowance = (await readContracts.YourContract.allowance(myAccount, contractAddr)).toNumber();
    console.log("ALLOWANCE BEFORE:", allowance);

    const tx = await writeContracts.YourContract.permit(
      myAccount, contractAddr, amount, deadline, split.v, split.r, split.s);
    await tx.wait();

    // confirm that the allowance was changed:
    allowance = (await readContracts.YourContract.allowance(myAccount, contractAddr)).toNumber();
    console.log("ALLOWANCE AFTER:", allowance);
  };

  return (
    // just a simple button to show metamask and the data:
    <div>
      <div style={{ margin: 32 }}>
        <button onClick={() => getAllowance()}>Get allowance</button>
      </div>
      <div style={{ margin: 32 }}>
        <button onClick={() => signData()}>Press to sign with EIP712</button>
      </div>
    </div>
  );
}

export default Home;
