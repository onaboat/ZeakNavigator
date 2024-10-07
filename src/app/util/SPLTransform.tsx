import { Rpc, bn, defaultTestStateTreeAccounts, LightSystemProgram, selectMinCompressedSolAccountsForTransfer, } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer, } from '@lightprotocol/compressed-token';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createCloseAccountInstruction } from '@solana/spl-token';
import { Transaction, PublicKey, VersionedTransaction, TransactionMessage, SendTransactionError, ComputeBudgetProgram } from '@solana/web3.js';

export async function compressTokens(
    connection: Rpc,
    publicKey: PublicKey,
    mint: PublicKey,
    amount: number,
    signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
) {
    try {
        if (!publicKey) {
            throw new Error("Wallet not connected");
        }
        const transaction = new Transaction();
        const ata = await getAssociatedTokenAddress(mint, publicKey, true);
        // Check if compressed account exists, otherwise create one
        const compressedAccountAddress = await CompressedTokenProgram.deriveTokenPoolPda(mint);
        let compressedAccountInfo = await connection.getAccountInfo(compressedAccountAddress);
        if (!compressedAccountInfo) {
            console.log("Compressed account not found. Creating compressed account...");
            const createCompressedAccountIx = await CompressedTokenProgram.createTokenPool({
                feePayer: publicKey,
                mint,
            });
            transaction.add(createCompressedAccountIx);
        } else {
            // Fetch the latest compressed token account state
            const compressedTokenAccounts = await connection.getCompressedTokenAccountsByOwner(publicKey, { mint: mint });
            const inputAccounts = compressedTokenAccounts.items;
            if (inputAccounts.length > 0) {
                let decompressAmount = inputAccounts.reduce((sum, account) => {
                    return sum + BigInt(account.parsed.amount);
                }, BigInt(0));
                // Fetch recent validity proof
                const proof = await connection.getValidityProof(
                    inputAccounts.map(account => bn(account.compressedAccount.hash))
                );
                // Create the decompress instruction
                const decompressIx = await CompressedTokenProgram.decompress({
                    payer: publicKey,
                    inputCompressedTokenAccounts: inputAccounts,
                    toAddress: ata,
                    amount: decompressAmount,
                    recentInputStateRootIndices: proof.rootIndices,
                    recentValidityProof: proof.compressedProof,
                });
                transaction.add(decompressIx);
                // Update the amount to compress
                amount += Number(decompressAmount);
            }
        }
        // Create the compress instruction
        const compressIx = await CompressedTokenProgram.compress({
            payer: publicKey,
            owner: publicKey,
            source: ata,
            toAddress: publicKey,
            amount: bn(amount),
            mint,
        });
        transaction.add(compressIx);

        // Get latest blockhash
        const latestBlockhash = await connection.getLatestBlockhash();

        const message = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: transaction.instructions,
        }).compileToV0Message();

        const versionedTransaction = new VersionedTransaction(message);
        // Sign and send the transaction
        console.log("Signing transaction...");
        const signedTransaction = await signTransaction(versionedTransaction);
        console.log("Transaction signed successfully");
        const transactionSignature = await connection.sendTransaction(signedTransaction);
        console.log(`Successfully compressed tokens with tx sig: ${transactionSignature}`);
    } catch (error) {
        if (error instanceof SendTransactionError) {
            console.error("Transaction simulation failed:", error.message);
            const logs = await error.logs;
            console.error("Transaction logs:", logs);
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}

export async function decompressTokens(
    connection: Rpc,
    publicKey: PublicKey,
    mint: PublicKey,
    amount: number,
    signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
) {
    try {
        const transaction = new Transaction()
        const ata = await getAssociatedTokenAddress(mint, publicKey, true);
        let ataInfo = await connection.getAccountInfo(ata);
        if (!ataInfo) {
            console.log("ATA does not exist. Creating ATA...");
            const createAtaIx = createAssociatedTokenAccountInstruction(
                publicKey,
                ata,
                publicKey,
                mint
            );

            transaction.add(createAtaIx);
            ataInfo = await connection.getAccountInfo(ata);
        }
        const compressedTokenAccounts = await connection.getCompressedTokenAccountsByOwner(publicKey, { mint });
        // Ensure compressedTokenAccounts is an array
        const accountsArray = compressedTokenAccounts.items || compressedTokenAccounts;
        // Select accounts 
        const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(accountsArray, bn(amount));
        // Fetch recent validity proof
        const proof = await connection.getValidityProof(
            inputAccounts.map(account => bn(account.compressedAccount.hash))
        );
        const decompressIx = await CompressedTokenProgram.decompress({
            payer: publicKey,
            inputCompressedTokenAccounts: inputAccounts,
            toAddress: ata,
            amount: amount,
            recentInputStateRootIndices: proof.rootIndices,
            recentValidityProof: proof.compressedProof,
        });
        // Additional compute units
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 });
        transaction.add(modifyComputeUnits, addPriorityFee, decompressIx);
        transaction.feePayer = publicKey;
        const message = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
            instructions: transaction.instructions,
        }).compileToV0Message();
        const versionedTransaction = new VersionedTransaction(message);
        const signedTransaction = await signTransaction(versionedTransaction);
        const transactionSignature = await connection.sendTransaction(signedTransaction);
        console.log(`Successfully decompressed tokens with tx sig: ${transactionSignature}`);
    } catch (error) {
        if (error instanceof SendTransactionError) {
            console.error("Transaction simulation failed:", error.message);
            const logs = await error.logs;
            console.error("Transaction logs:", logs);
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}


export async function deleteATASPL(
    connection: Rpc,
    publicKey: PublicKey,
    mint: PublicKey,
    signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>) {
    try {
        const ata = await getAssociatedTokenAddress(mint, publicKey, true);
        const deleteAtaIx = createCloseAccountInstruction(ata, publicKey, publicKey);
        const deleteAtaTx = new Transaction().add(deleteAtaIx);
        deleteAtaTx.feePayer = publicKey;
        const message = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
            instructions: deleteAtaTx.instructions,
        }).compileToV0Message();
        const versionedTransaction = new VersionedTransaction(message);
        const signedTransaction = await signTransaction(versionedTransaction);
        const transactionSignature = await connection.sendTransaction(signedTransaction);
        console.log(`Successfully deleted ATA with tx sig: ${transactionSignature}`);
    } catch (error) {
        console.error("Error deleting ATA:", error);
    }
}

export async function compressSOL(connection: Rpc, publicKey: PublicKey, amount: number, signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>) {
    try {
        const { blockhash } = await connection.getLatestBlockhash();
        const ix = await LightSystemProgram.compress({
            payer: publicKey,
            toAddress: publicKey,
            lamports: amount,
            outputStateTree: defaultTestStateTreeAccounts().merkleTree,
        });
        const transaction = new Transaction().add(ix);
        const message = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: transaction.instructions,
        }).compileToV0Message();
        const versionedTransaction = new VersionedTransaction(message);
        const signedTransaction = await signTransaction(versionedTransaction);
        const transactionSignature = await connection.sendTransaction(signedTransaction);
        console.log("Transaction Signature:", transactionSignature);
    } catch (error) {
        console.error("Error compressing SOL:", error);
    }
}

export async function decompressSOL(connection: Rpc, publicKey: PublicKey, amount: number, signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>) {
    try {
        const { blockhash } = await connection.getLatestBlockhash();
        const compressedAccounts = (
            await connection.getCompressedAccountsByOwner(publicKey)
        ).items;
        const [inputAccounts] = selectMinCompressedSolAccountsForTransfer(
            compressedAccounts,
            amount
        );
        const proof = await connection.getValidityProof(
            inputAccounts.map((account) => bn(account.hash))
        );
        const ix = await LightSystemProgram.decompress({
            payer: publicKey,
            inputCompressedAccounts: inputAccounts,
            toAddress: publicKey,
            lamports: amount,
            recentInputStateRootIndices: proof.rootIndices,
            recentValidityProof: proof.compressedProof,
        });
        const transaction = new Transaction().add(ix);
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 });
        transaction.add(modifyComputeUnits, addPriorityFee);
        const message = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: transaction.instructions,
        }).compileToV0Message();
        const versionedTransaction = new VersionedTransaction(message);
        const signedTransaction = await signTransaction(versionedTransaction);
        const transactionSignature = await connection.sendTransaction(signedTransaction);
        console.log("Transaction Signature:", transactionSignature);
    } catch (error) {
        console.error("Error decompressing SOL:", error);
    }
}