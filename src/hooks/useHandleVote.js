// import { useCallback } from "react";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { isSupportedChain } from "../utils";
import { getProvider } from "../constants/providers";
import { getProposalsContract } from "../constants/contracts";
import { toast } from "react-toastify";

const useHandleVote = () => {
    const { chainId } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    return (async (id) => {
        if (!isSupportedChain(chainId)) return toast.error("Wrong network");
        const readWriteProvider = getProvider(walletProvider);
        const signer = await readWriteProvider.getSigner();

        const contract = getProposalsContract(signer);

        try {
            const transaction = await contract.vote(id);
            console.log("transaction: ", transaction);
            const receipt = await transaction.wait();

            console.log("receipt: ", receipt);

            if (receipt.status) {
                return toast.success("vote successfull!");
            }

            toast.error("vote failed!");
        } catch (error) {
            // console.log(error);
            let errorText;
            if (error.reason === "Has no right to vote") {
                errorText = "you have no right to vote!";
            } else if (error.reason === "Already voted.") {
                errorText = "you have voted already!";
            } else {
                errorText = "an unknown error occured!";
            }

            toast.error(`Error: ${errorText}`);
        }
    });
}

export default useHandleVote