import { Rpc } from "@lightprotocol/stateless.js";
import { Keypair, PublicKey,  SystemProgram,  Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { createInitializeAccountInstruction, createCloseAccountInstruction, NATIVE_MINT, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, createSyncNativeInstruction, getAccount, } from "@solana/spl-token";    


export async function wrapSOL(
    connection: Rpc, 
    publicKey: PublicKey, 
    amount: number, 
    signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
  ) {
    try {

        if (!publicKey) {
            throw new Error("Wallet not connected");
          }

            
            const transaction = new Transaction();

            let ata = await getAssociatedTokenAddress(
                NATIVE_MINT, 
                publicKey, 
              );


              let ataInfo = await connection.getAccountInfo(ata);
              if (!ataInfo) {
                  console.log("ATA does not exist. Creating ATA...");
                  const createAtaIx = createAssociatedTokenAccountInstruction(
                      publicKey,
                      ata,
                      publicKey,
                      NATIVE_MINT
                  );
                  console.log("ATA created: ", ata.toBase58());
            
                  transaction.add(createAtaIx);
                }
          


                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: ata,
                        lamports: amount,
                      }),
                )

                transaction.add(  
                    createSyncNativeInstruction(ata),
                )

                const latestBlockhash = await connection.getLatestBlockhash();
                transaction.feePayer = publicKey;
  
                const message = new TransactionMessage({
                  payerKey: publicKey,
                  recentBlockhash: latestBlockhash.blockhash,
                  instructions: transaction.instructions,
                }).compileToV0Message();
            
                const versionedTransaction = new VersionedTransaction(message);
                console.log("Versioned Transaction: ", versionedTransaction);

             
                    
                console.log("Signing transaction...");
                const signedTransaction = await signTransaction(versionedTransaction);
           
      
                
                const transactionSignature = await connection.sendTransaction(signedTransaction, {
                  skipPreflight: true,
                });
                console.log(`Successfully wraped tokens with tx sig: ${transactionSignature}`);


    }
    catch (error) {
        console.error("Error wrapping SOL:", error);
        throw error;
    }   
}

export async function unwrapSOL(
  connection: Rpc, 
  publicKey: PublicKey, 
  amount: number,  // Amount in lamports to unwrap
  signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
) {
  try {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();

    // Get the associated token address for the wrapped SOL (WSOL)
    let ata = await getAssociatedTokenAddress(NATIVE_MINT, publicKey);
    console.log("Original ATA: ", ata.toBase58());

    // Check if the ATA exists and has sufficient balance
    const accountInfo = await connection.getAccountInfo(ata);
    if (!accountInfo) {
      throw new Error("Wrapped SOL account does not exist");
    }

    const tokenAccount = await getAccount(connection, ata);
    const balance = Number(tokenAccount.amount);
    console.log(`Current WSOL balance: ${balance}`);

    if (balance < amount) {
      throw new Error(`Insufficient balance. Available: ${balance}, Requested: ${amount}`);
    }
 
     // Create a new temporary token account
     const newAccount = Keypair.generate();
     const rent = await connection.getMinimumBalanceForRentExemption(165);
 
     transaction.add(
       SystemProgram.createAccount({
         fromPubkey: publicKey,
         newAccountPubkey: newAccount.publicKey,
         space: 165,
         lamports: rent,
         programId: TOKEN_PROGRAM_ID
       }),
       createInitializeAccountInstruction(
         newAccount.publicKey,
         NATIVE_MINT,
         publicKey
       )
     );
 
     // Transfer the desired amount of WSOL to the new account
     transaction.add(
       createTransferInstruction(
         ata,
         newAccount.publicKey,
         publicKey,
         BigInt(amount)
       )
     );
 
     // Close the newly created account
     transaction.add(
       createCloseAccountInstruction(
         newAccount.publicKey,
         publicKey,
         publicKey
       )
     );

    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.feePayer = publicKey;

    const message = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: transaction.instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(message);
    console.log("Versioned Transaction: ", versionedTransaction);
    versionedTransaction.sign([newAccount]);

    // Sign and send the transaction
    const signedTransaction = await signTransaction(versionedTransaction);
    console.log("Transaction signed successfully");

    const transactionSignature = await connection.sendTransaction(signedTransaction);
    console.log(`Successfully unwrapped ${amount} lamports of SOL with tx sig: ${transactionSignature}`);

    return transactionSignature;

  } catch (error) {
    console.error("Error unwrapping SOL:", error);
    throw error;
  }
}
