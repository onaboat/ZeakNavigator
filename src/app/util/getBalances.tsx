import { PublicKey, } from "@solana/web3.js";
import { Rpc, } from "@lightprotocol/stateless.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, AccountLayout, getAssociatedTokenAddressSync, NATIVE_MINT, } from "@solana/spl-token";

export async function getSolBalance(publicKey: PublicKey, connection: Rpc): Promise<number> {
    try {
        const solBalance = await connection.getBalance(publicKey);
        if (solBalance === 0) {
            // console.warn(`SOL balance for ${publicKey.toBase58()} is 0`);
            return 0;
        }
        return solBalance;
    } catch (error) {
        console.error("Error fetching SOL balance:", error);
        throw error;
    }
}

export async function getCompressedSolBalance(publicKey: PublicKey, connection: Rpc): Promise<number> {
    try {
        const compressedSolBalance = await connection.getCompressedBalanceByOwner(publicKey);
        // console.log("compressedSolBalance", compressedSolBalance);
        return compressedSolBalance;
    } catch (error) {
        console.error("Error fetching compressed SOL balance:", error);
        throw error;
    }
}


export async function getWrappedSolBalance(publicKey: PublicKey, connection: Rpc): Promise<number> {
    try {
        const ata = getAssociatedTokenAddressSync(
            NATIVE_MINT,
            publicKey,
        );
        // console.log("ata", ata.toString());

        // Check if the account exists
        const accountInfo = await connection.getAccountInfo(ata);
        if (accountInfo === null) {
            // console.warn(`No wrapped SOL account found for ${publicKey.toBase58()}`);
            return 0;
        }

        const wrappedSolBalance = await connection.getTokenAccountBalance(ata);
        // console.log("wrappedSolBalance", wrappedSolBalance);
        return Number(wrappedSolBalance.value.amount);
    } catch (error) {
        // console.error("Error fetching wrapped SOL balance:", error);
        return 0;
    }
}


export async function getSplAccounts(publicKey: PublicKey, connection: Rpc): Promise<{ splAccountsList: any, wrappedSolAccount: any }> {
    try {
        const splAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            {
                programId: TOKEN_PROGRAM_ID,
            }
        );
        // console.log("splAccount all", splAccounts);
        const splAccountsList: any[] = [];
        const wrappedSolAccount: any[] = [];

        splAccounts.value.forEach((splAccounts) => {
            const accountData = AccountLayout.decode(splAccounts.account.data);
            if (splAccounts.pubkey.toBase58() === getAssociatedTokenAddressSync(
                NATIVE_MINT,
                publicKey,
            ).toBase58()) {
                wrappedSolAccount.push({
                    ata: splAccounts.pubkey.toBase58(),
                    mint: NATIVE_MINT.toBase58(),
                    amount: accountData.amount,
                });
            } else {
                splAccountsList.push({
                    ata: splAccounts.pubkey.toBase58(),
                    mint: new PublicKey(accountData.mint).toBase58(),
                    amount: accountData.amount,
                });
            }
        });
        return { splAccountsList, wrappedSolAccount };
    } catch (error) {
        console.error("Error for getSplAccounts:", error);
        throw error;
    }
}



export async function getSplAccounts2022(publicKey: PublicKey, connection: Rpc): Promise<any[]> {
    try {
        const splAccounts2022 = await connection.getTokenAccountsByOwner(
            publicKey,
            {
                programId: TOKEN_2022_PROGRAM_ID,
            }
        );
        const splAccounts2022List: any[] = [];

        splAccounts2022.value.forEach((splAccounts) => {
            const accountData = AccountLayout.decode(splAccounts.account.data);
            splAccounts2022List.push({
                ata: splAccounts.pubkey.toBase58(),
                mint: new PublicKey(accountData.mint).toBase58(),
                amount: accountData.amount
            });
        })
        return splAccounts2022List;
    } catch (error) {
        console.error("Error for getSplAccounts2022:", error);
        throw error;
    }
}

export async function getZkAccountsBallance(publicKey: PublicKey, connection: Rpc): Promise<any[]> {
    const ZkAccounts = await connection.getCompressedTokenBalancesByOwner(publicKey);
    // console.log("ZkAccounts", ZkAccounts);
    const zkAccountsListBalance: any[] = [];
    ZkAccounts.items.forEach((item) => {
        zkAccountsListBalance.push({
            mint: item.mint.toBase58(),
            balance: item.balance.toNumber()
        });
    });
    return zkAccountsListBalance;
}


export async function getZkAccounts(publicKey: PublicKey, connection: Rpc): Promise<any[]> {
    const ZKAta = await connection.getCompressedTokenAccountsByOwner(publicKey);
    // console.log("ZKAta", ZKAta);
    const zkAccountsList: any[] = [];

    ZKAta.items.forEach((item) => {
        zkAccountsList.push({
            ata: item.compressedAccount.merkleTree.toString(),
            mint: item.parsed.mint.toString(),
            balance: item.parsed.amount.toString()
        });
    });
    return zkAccountsList;
}

export async function getAllAccounts(publicKey: PublicKey, connection: Rpc): Promise<{ splAccountsList: any; splAccounts2022: any; wrappedSolAccount: any; zkAccountsList: any; }> {
    const { splAccountsList, wrappedSolAccount } = await getSplAccounts(publicKey, connection);
    const splAccounts2022 = await getSplAccounts2022(publicKey, connection);
    const zkAccountsList = await getZkAccounts(publicKey, connection);
    // console.log("splAccounts", splAccountsList);
    // console.log("splAccounts2022", splAccounts2022);
    // console.log("zkAccountsList", zkAccountsList);
    return { splAccountsList, splAccounts2022, wrappedSolAccount, zkAccountsList };
}

export async function getAllBalances(publicKey: PublicKey, connection: Rpc): Promise<{ solBalance: any; solCompressedBalance: any; solWrappedBalance: any }> {
    const solBalance = await getSolBalance(publicKey, connection);
    const solCompressedBalance = await getCompressedSolBalance(publicKey, connection);
    const solWrappedBalance = await getWrappedSolBalance(publicKey, connection);
    // console.log("wrappedSolBalance", solWrappedBalance);
    return { solBalance, solCompressedBalance, solWrappedBalance };
}

