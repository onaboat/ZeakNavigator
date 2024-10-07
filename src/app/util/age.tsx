import { PublicKey } from '@solana/web3.js';
import { Rpc } from '@lightprotocol/stateless.js';

export async function calculateWalletAge(walletAddress: PublicKey, connection: InstanceType<typeof Rpc>) {

    try {
        const pubKey = walletAddress;
        let oldestTimestamp = null;
        let totalTransactions = 0;
        let lastSignature = null;

        while (true) {
            const options: any = {
                limit: 1000,
                before: lastSignature
            };

            const transactions: any = await connection.getSignaturesForAddress(pubKey, options);

            if (transactions.length === 0) {
                break;
            }

            totalTransactions += transactions.length;

            // Update the oldest timestamp if necessary
            const batchOldestTimestamp = transactions[transactions.length - 1].blockTime;
            if (oldestTimestamp === null || batchOldestTimestamp < oldestTimestamp) {
                oldestTimestamp = batchOldestTimestamp;
            }

            // Prepare for the next iteration
            lastSignature = transactions[transactions.length - 1].signature;

            // Optional: add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (oldestTimestamp === null) {
            console.log('No transactions found for this wallet.');
            return null;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const ageInSeconds = currentTime - oldestTimestamp;
        const ageInDays = Math.floor(ageInSeconds / (24 * 60 * 60));

        return {
            ageInSeconds,
            ageInDays,
            oldestTransactionDate: new Date(oldestTimestamp * 1000).toISOString(),
            totalTransactions
        };

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
