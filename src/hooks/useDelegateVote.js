import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { useCallback } from "react";
import { isSupportedChain } from "../utils";
import { getProvider } from "../constants/providers";
import { getProposalsContract } from "../constants/contracts";
import { isAddress } from "ethers";
import { toast } from 'react-toastify';


const useDelegateVote = (address) => {
    const { chainId } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    return useCallback(async () => {
        if (!isSupportedChain(chainId)) return toast.error("Wrong network");
        if (!isAddress(address)) return toast.error("Invalid address");
        const readWriteProvider = getProvider(walletProvider);
        const signer = await readWriteProvider.getSigner();

        const contract = getProposalsContract(signer);

        try {
            const transaction = await contract.delegate(address);
            console.log("transaction: ", transaction);
            const receipt = await transaction.wait();

            console.log("receipt: ", receipt);

            if (receipt.status) {
                return toast.success("Delegated successfully!");
            }

            toast.error("Delegation failed!");
        } catch (error) {
            // console.log(error);
            let errorText;
            if (error.reason === "You already voted.") {
                errorText = "You have voted already!";
            } else if (error.reason === "Self-delegation is disallowed.") {
                errorText = "You cannot delegation yourself!";
            } else if (error.reason === "Found loop in delegation.") {
                errorText = "You cannot delegate the address that delegated you!";
            } else {
                errorText = "An unknown error occured!";
            }

            toast.error(`Error: ${errorText}`);
        }
    }, [address, chainId, walletProvider])
}

export default useDelegateVote