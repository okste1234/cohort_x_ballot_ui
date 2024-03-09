import { useCallback } from "react";
import { isSupportedChain } from "../utils";
import { isAddress } from "ethers";
import { getProvider } from "../constants/providers";
import { getProposalsContract } from "../constants/contracts";
import {
    useWeb3ModalAccount,
    useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { toast } from "react-toastify";

const useGiveRightToVote = (address) => {
    const { chainId } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    return useCallback(async () => {
        if (!isSupportedChain(chainId)) return toast.error("Wrong network");
        if (!isAddress(address)) return toast.error("Invalid address");
        const readWriteProvider = getProvider(walletProvider);
        const signer = await readWriteProvider.getSigner();

        const contract = getProposalsContract(signer);

        try {
            const estimatedGas = await contract.giveRightToVote.estimateGas(
                address
            );
            // console.log("estimatedGas: ", estimatedGas);

            // const feeData = await readWriteProvider.getFeeData();

            // console.log("feeData: ", feeData);

            // const gasFee = estimatedGas * feeData.gasPrice;

            // console.log("estimated: ", gasFee);

            const transaction = await contract.giveRightToVote(address, {
                gasLimit: estimatedGas,
            });
            console.log("transaction: ", transaction);
            const receipt = await transaction.wait();

            console.log("receipt: ", receipt);

            if (receipt.status) {
                return toast.success("giveRightToVote successfull!");
            }

            toast.error("giveRightToVote failed!");
        } catch (error) {
            // console.error("error: ", error);
            let errorText;
            if (error.reason === "The voter already voted.") {
                errorText = "This address has voted!";
            } else if (error.revert === null) {
                errorText = "Voter already added!";
            }
            else {
                errorText = "An unknown error occured!";
            }

            toast.error(`Error: ${errorText}`);
        }
    }, [address, chainId, walletProvider]);
};

export default useGiveRightToVote;
