import { Rpc, } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

// get compressed transactions
export async function getCompressedSignatures(connection: Rpc, publicKey: PublicKey) {
    const signatures = await connection.getCompressionSignaturesForOwner(publicKey);
    //  const parsedTransaction = await connection.getTransactionWithCompressionInfo(signatures.items[0].signature);
    return signatures;
}

// get all transactions for an address
export async function getAllTransactionsForAddress(connection: Rpc, publicKey: PublicKey) {
    const transactions = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
    const transactionsWithMeta = await connection.getParsedTransactions(
        transactions.map(t => t.signature),
        { maxSupportedTransactionVersion: 0 }
    );
    return transactionsWithMeta;
}

