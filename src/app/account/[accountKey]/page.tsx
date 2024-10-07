"use client";
import { PublicKey, ParsedTransactionWithMeta, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Rpc, createRpc } from "@lightprotocol/stateless.js";
import { useEffect, useState } from 'react';
import { calculateWalletAge } from "../../util/age"
import { getAllBalances, getAllAccounts } from "../../util/getBalances"
import { compressSOL, compressTokens, decompressSOL, decompressTokens, deleteATASPL } from "../../util/SPLTransform"
import { getAllTransactionsForAddress } from "../../util/transactions"
import { unwrapSOL, wrapSOL } from "../../util/wrapSOL"
import { useWallet } from '@solana/wallet-adapter-react';
import Others from "@/app/ui/others";


let RPC_ENDPOINT = process.env.NEXT_PUBLIC_API_URL_DEV;
const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
let connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT)


export default function Account({ params }: { params: { accountKey: string } }) {
  const accountPublicKey = new PublicKey(params.accountKey!)
  const [walletAge, setWalletAge] = useState(0);
  async function calculateAndSetWalletAge(accountPublicKey: PublicKey, connection: Rpc) {
    const age = await calculateWalletAge(accountPublicKey, connection)
    setWalletAge(age!.ageInDays)
  }
  const [transactions, setTransactions] = useState<ParsedTransactionWithMeta[]>([]);
  const fetchTransactions = async () => {
    const data = await getAllTransactionsForAddress(connection, accountPublicKey);
    const filteredData = data.filter((transaction) => transaction !== null);
    setTransactions(filteredData);
    console.log("filteredData", filteredData)
  };
  useEffect(() => {
    fetchTransactions();
    calculateAndSetWalletAge(accountPublicKey, connection)
  }, []);
  return (
    <div className="container mx-auto p-8">
      <main className="flex flex-col justify-around w-full h-full">
        <div>
          <h1 className="text-2xl font-bold pb-4 "><a href="/"> &larr; Back </a></h1>
        </div>
        <div>
          <h6 className="text-sm text-primary">Account</h6>
          <h1 className="text-3xl font-bold text-primary break-all">{accountPublicKey.toString()}</h1>
          <h5 className="text-sm">{walletAge ? `${walletAge} days old` : ""}</h5>
        </div>
        <div className="pb-10 pt-5">
          <SolanaInfo params={params} fetchTransactions={fetchTransactions} />
        </div>
        <div className="flex flex-col gap-4 pb-20">
          <div>
            <Tokens params={params} fetchTransactions={fetchTransactions} />
          </div>
          <div>
            {/* 
            TO DO
            <NFT/> */}
          </div>
          <div>
            <Transactions transactions={transactions} />
          </div>
          <div>
            <Others />
          </div>
        </div>
      </main>
    </div>
  );
}


const SolanaInfo = ({ params, fetchTransactions }: { params: { accountKey: string }; fetchTransactions: () => void }) => {
  const accountPublicKey = new PublicKey(params.accountKey!)
  const { signTransaction } = useWallet();
  const { publicKey } = useWallet();

  const [solBalance, setSolBalance] = useState(0);
  const [solCompressedBalance, setSolCompressedBalance] = useState(0);
  const [solWrappedBalance, setSolWrappedBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [solAmount, setSolAmount] = useState(0);
  const [cSolAmount, setCSolAmount] = useState(0);
  const [wSolAmount, setWSolAmount] = useState(0);

  async function fetchSOLBalances() {
    const { solBalance, solCompressedBalance, solWrappedBalance } = await getAllBalances(accountPublicKey, connection);
    setSolBalance(solBalance);
    setSolCompressedBalance(solCompressedBalance);
    setSolWrappedBalance(solWrappedBalance);
    setBalanceLoading(false);
  }

  useEffect(() => {
    fetchSOLBalances();
  }, []);

  function checkIfWalletMatchesAccount() {
    if (publicKey?.toString() !== accountPublicKey.toString()) {
      return false
    }
    return true
  }



  const handleWrapSOL = async () => {
    if (!checkIfWalletMatchesAccount()) {
      return;
    }
    if (!signTransaction) {
      return;
    }
    try {
      console.log("Wrapping SOL");
      await wrapSOL(connection, publicKey!, solAmount, signTransaction);
      setBalanceLoading(true);
      setTimeout(async () => {
        setSolAmount(0);
        await fetchSOLBalances();
        fetchTransactions();
      }, 1000);
    } catch (error) {
      console.error("Error wrapping SOL:", error);
    }
  };

  const handleUnwrapSOL = async () => {
    if (!checkIfWalletMatchesAccount()) {
      return;
    }
    if (!signTransaction) {
      return;
    }
    try {
      console.log("Unwrapping SOL");
      await unwrapSOL(connection, publicKey!, wSolAmount, signTransaction);
      setBalanceLoading(true);
      setTimeout(async () => {
        setWSolAmount(0);
        await fetchSOLBalances();
        fetchTransactions();
      }, 1000);
      console.log("Transaction sent successfully");
    } catch (error) {
      console.error("Error unwrapping SOL:", error);
    }
  };

  const handleCompressSOL = async () => {
      if (!checkIfWalletMatchesAccount()) {
      return;
    }
    if (!signTransaction) {
      return;
    }
    try {
      console.log("Compressing SOL");
      await compressSOL(connection, publicKey!, solAmount, signTransaction);
      setBalanceLoading(true);
      setTimeout(async () => {
        setSolAmount(0);
        await fetchSOLBalances();
        fetchTransactions();
      }, 1000);
      console.log("Transaction sent successfully");
    } catch (error) {
      console.error("Error compressing tokens:", error);
    }
  };

  const handleDecompressSOL = async () => {
    if (!checkIfWalletMatchesAccount()) {
      return;
    }
    if (!signTransaction) {
      return;
    }

    try {
      console.log("Decompressing SOL");
      await decompressSOL(connection, publicKey!, cSolAmount, signTransaction);
      setBalanceLoading(true);
      setTimeout(async () => {
        setCSolAmount(0);
        await fetchSOLBalances();
        fetchTransactions();
      }, 1000);
      console.log("Transaction sent successfully");
    } catch (error) {
      console.error("Error compressing tokens:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-2 ">
      <div className="card bg-base-100 border border-primary w-full  shadow hover:shadow-2xl">
        <div className="">
          {balanceLoading ? (
            <div className="flex flex-col gap-2 p-4">
              <div className="skeleton h-6 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-6 w-full"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-row justify-start items-center p-6 gap-2">
                <div className="flex flex-row items-center gap-2">
                  <img src="/coins/solanaLogoMark.svg" alt="Solana" className="w-4 h-4" />
                  <h2 className="card-title">SOL</h2>
                </div>
                <div className="col-span-1 badge badge-base-200 ">Native</div>
              </div>

              <div className="p-6 bg-primary">
                <div className="text-xs font-bold text-white">Balance</div>
                <h2 className="text-3xl font-extrabold text-white">
                  {(solBalance / LAMPORTS_PER_SOL).toFixed(9)}<br/> SOL
                </h2>
              </div>
              <div className="card-actions p-6">
                <input type="text" placeholder="Enter amount in lamports" className="input input-bordered w-full mb-2" disabled={!publicKey}  value={solAmount || ''}  onChange={(e) => setSolAmount(Number(e.target.value))} id="solAmount" />
                <div className="join w-1/2">
                  <button className="btn btn-sm btn-primary btn-outline w-full join-item" disabled={!publicKey} onClick={() => handleCompressSOL()}>Compress</button>
                  <button className="btn btn-sm btn-primary btn-outline w-full join-item" disabled={!publicKey} onClick={() => handleWrapSOL()}>Wrap</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card bg-base-100 border border-primary w-full  shadow hover:shadow-2xl hover:border-5">
        <div className="">
          {balanceLoading ? (
            <div className="flex flex-col gap-2 p-4">
              <div className="skeleton h-6 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-6 w-full"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-row justify-start items-center p-6 gap-2">
                <div className="flex flex-row items-center gap-2">
                  <img src="/coins/solanaLogoMark.svg" alt="Solana" className="w-4 h-4" />
                  <h2 className="card-title">SOL</h2>
                </div>
                <div className="col-span-1 badge badge-primary ">Compressed</div>
              </div>
              <div className="p-6 bg-primary">
                <div className="text-xs font-bold text-white">Balance</div>
                <h2 className="text-3xl font-extrabold text-white">
                  {(solCompressedBalance / LAMPORTS_PER_SOL).toFixed(9)}<br/> cSOL
                </h2>
              </div>
              <div className="card-actions w-full p-6">
                <input type="text" placeholder="Enter amount in lamports" className="input input-bordered w-full mb-2" disabled={!publicKey} value={cSolAmount || ''} onChange={(e) => setCSolAmount(Number(e.target.value))} id="cSolAmount"/>
                <button className="btn btn-sm btn-primary btn-outline w-full" disabled={!publicKey} onClick={() => handleDecompressSOL()}>DeCompress</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card bg-base-100 border border-primary w-full  shadow hover:shadow-2xl">
        <div className="">
          {balanceLoading ? (
            <div className="flex flex-col gap-2 p-4">
              <div className="skeleton h-6 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-6 w-full"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-row justify-start items-center p-6 gap-2">
                <div className="flex flex-row items-center gap-2">
                  <img src="/coins/solanaLogoMark.svg" alt="Solana" className="w-4 h-4" />
                  <h2 className="card-title">SOL</h2>
                </div>
                <div className="col-span-1 badge badge-neutral">Wrapped</div>
              </div>
              <div className="p-6 bg-primary">
                <div className="text-xs font-bold text-white">Balance</div>
                <h2 className="text-3xl font-extrabold text-white">
                  {(solWrappedBalance / LAMPORTS_PER_SOL).toFixed(9)}<br/> wSOL
                </h2>
              </div>
              <div className="card-actions w-full p-6">
                <input type="text" placeholder="Enter amount in lamports" className="input input-bordered w-full mb-2" disabled={!publicKey} value={wSolAmount || ''} onChange={(e) => setWSolAmount(Number(e.target.value))} id="wSolAmount" />
                <button className="btn btn-sm btn-primary btn-outline w-full" disabled={!publicKey} onClick={() => handleUnwrapSOL()}>unWrap</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TokensProps {
  params: { accountKey: string };
}


const Tokens: React.FC<TokensProps & { fetchTransactions: () => void }> = ({ params, fetchTransactions }) => {
  const accountPublicKey = new PublicKey(params.accountKey!);
  const { signTransaction } = useWallet();
  const { publicKey } = useWallet();

  const [loading, setLoading] = useState(true);
  const [splAccounts, setSplAccounts] = useState([]);
  const [splAccounts2022, setSplAccounts2022] = useState([]);
  const [zkAccountsList, setZkAccountsList] = useState([]);

  const [splAmounts, setSplAmounts] = useState<{ [key: string]: number }>({});
  const [csplAmounts, setCSplAmounts] = useState<{ [key: string]: number }>({});

  async function fetchTokenAccounts() {
    const { splAccountsList, splAccounts2022, zkAccountsList } = await getAllAccounts(accountPublicKey, connection);
    setSplAccounts(splAccountsList);
    setSplAccounts2022(splAccounts2022);
    setZkAccountsList(zkAccountsList);
    setLoading(false);
  }

  useEffect(() => {
    fetchTokenAccounts();
  }, []);

  function checkIfWalletMatchesAccount() {
    if (publicKey?.toString() !== accountPublicKey.toString()) {
      return false;
    }
    return true;
  }

  const handleCompressTokens = async (mint: string) => {
    if (!checkIfWalletMatchesAccount()) {
      return;
    }

    if (!signTransaction) {
      return;
    }

    try {
      const amount = splAmounts[mint] || 0; 
      console.log("Compressing tokens for mint:", mint, "with amount:", amount);
      await compressTokens(connection, publicKey!, new PublicKey(mint), amount, signTransaction);
      setLoading(true);
      setTimeout(async () => {
        setSplAmounts({ ...splAmounts, [mint]: 0 });
        await fetchTokenAccounts();
        fetchTransactions();
      }, 1000);
    } catch (error) {
      console.error("Error compressing tokens:", error);
    }
  };

  const handleDecompressTokens = async (mint: string) => {
    if (!checkIfWalletMatchesAccount()) {
      return;
    }
    if (!signTransaction) {
      return;
    }
    try {
      const amount = csplAmounts[mint] || 0; 
      console.log("Decompressing tokens for mint:", mint, "with amount:", amount);
      await decompressTokens(connection, publicKey!, new PublicKey(mint), amount, signTransaction);
      setLoading(true);
      setTimeout(async () => {
        setCSplAmounts({ ...csplAmounts, [mint]: 0 });
        await fetchTokenAccounts();
        fetchTransactions();
      }, 1000);
    } catch (error) {
      console.error("Error decompressing tokens:", error);
    }
  };

  const handleDeleteATASPL = async (mint: string) => {
    if (!checkIfWalletMatchesAccount()) {
      return;
    }
    if (!signTransaction) {
      return;
    }
    try {
      console.log("Deleting tokens for mint:", mint);
      await deleteATASPL(connection, publicKey!, new PublicKey(mint), signTransaction);
      setLoading(true);
      setTimeout(async () => {
        setSplAmounts({ ...splAmounts, [mint]: 0 });
        await fetchTokenAccounts();
        fetchTransactions();
      }, 1000);
    } catch (error) {
      console.error("Error deleting tokens:", error);
    }
  };
  return (
    <div className="">
      {loading ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {zkAccountsList?.map((zkAccount: { ata: string; mint: string; balance: string }) => (
            <div key={`${zkAccount.mint}-${zkAccount.ata}`} className="mb-4 break-inside rounded-lg border shadow bg-white dark:bg-slate-800 flex flex-col bg-clip-border hover:shadow-xl">
              <div className="flex flex-col p-6 gap-1 justify-between">
                <div className="flex flex-row justify-between">
                  <img src="/coins/Compressed.svg" alt="Compressed" className="w-6 h-6" />
                  <div className="col-span-1 badge badge-primary pull-right text-xs">Compressed</div>
                </div>
                <div className="text-xs font-bold">Mint</div>
                <div className="col-span-2 text-sm truncate">{zkAccount.mint}</div>
              </div>
              <div className="p-6 bg-primary">
                <div className="text-xs font-bold text-white">Balance</div>
                <h2 className="text-3xl font-extrabold text-white">
                  {(Number(zkAccount.balance) / LAMPORTS_PER_SOL).toFixed(9)}
                </h2>
                <div className="col-span-2 text-sm truncate text-gray-500">{zkAccount.ata}</div>
              </div>
              <div className="p-6">
                <div className="col-span-1 w-full">
                  <input
                    type="text"
                    placeholder="Enter amount in lamports"
                    className="input input-bordered w-full mb-2"
                    disabled={!publicKey}
                    value={csplAmounts[zkAccount.mint] || ''} // Use specific amount for the mint
                    onChange={(e) => setCSplAmounts({ ...csplAmounts, [zkAccount.mint]: Number(e.target.value) })} // Update specific mint amount
                    id={`cspl-amount-${zkAccount.mint}`}
                  />
                  <button
                    className={`btn btn-outline btn-sm w-full`}
                    disabled={!publicKey}
                    onClick={() => handleDecompressTokens(zkAccount.mint)}
                  >
                    DeCompress
                  </button>
                </div>
              </div>
            </div>
          ))}

          {splAccounts?.map((splAccount: { ata: string; mint: string; amount: string }) => (
            <div key={`${splAccount.mint}-${splAccount.ata}`} className="mb-4 break-inside rounded-lg border bg-white shadow dark:bg-slate-800 flex flex-col bg-clip-border hover:shadow-xl">
              <div className="flex flex-col p-6 gap-1 justify-between">
                <div className="flex flex-row justify-between">
                  <img src="/coins/Standard.svg" alt="SPL Token" className="w-6 h-6" />
                  <div className="col-span-1 badge badge-neutral pull-right text-xs">SPL Token</div>
                </div>
                <div className="text-xs font-bold">Mint</div>
                <div className="col-span-2 text-sm truncate">{splAccount.mint}</div>

              </div>
              <div className="p-6 bg-primary">
                <div className="text-xs font-bold text-white">Balance</div>
                <h2 className="text-3xl font-extrabold text-white">
                  {(Number(splAccount.amount) / LAMPORTS_PER_SOL).toFixed(9)}
                </h2>
                <div className="col-span-2 text-sm truncate text-gray-500">{splAccount.ata}</div>
              </div>
              <div className="p-6">
                <div className="col-span-1 w-full">
                  <input
                    type="text"
                    placeholder="Enter amount in lamports"
                    className="input input-bordered w-full mb-2"
                    disabled={!publicKey}
                    value={splAmounts[splAccount.mint] || ''} // Use specific amount for the mint
                    onChange={(e) => setSplAmounts({ ...splAmounts, [splAccount.mint]: Number(e.target.value) })} // Update specific mint amount
                    id={`spl-amount-${splAccount.mint}`}
                  />
                  {Number(splAccount.amount) === 0 ? (
                    <button
                      className={`btn btn-outline btn-sm w-full`}
                      disabled={!publicKey}
                      onClick={() => handleDeleteATASPL(splAccount.mint)}
                    >
                      Delete & Return SOL
                    </button>
                  ) : (
                    <button
                      className={`btn btn-outline btn-sm w-full`}
                      disabled={!publicKey}
                      onClick={() => handleCompressTokens(splAccount.mint)}
                    >
                      Compress
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {splAccounts2022?.map((splAccount2022: { ata: string; mint: string; balance: string }) => (
            <div key={`${splAccount2022.mint}-${splAccount2022.ata}`} className="mb-4 break-inside rounded-lg border bg-white shadow dark:bg-slate-800 flex flex-col bg-clip-border hover:shadow-xl">
              <div className="flex flex-col p-6 gap-1 justify-between">
                <div className="flex flex-row gap-2">
                  <img src="/coins/20224.svg" alt="Compressed" className="w-6 h-6" />
                  <div className="col-span-1 badge badge-neutral pull-right text-xs">2022</div>
                </div>
                <div className="text-md">Token Name</div>
                <div className="text-xs font-bold">Mint</div>
                <div className="col-span-2 text-sm truncate">{splAccount2022.mint}</div>
              </div>
              <div className="p-6 bg-primary">
                <div className="text-xs font-bold text-white">Balance</div>
                <h2 className="text-3xl font-extrabold text-white">
                  {(Number(splAccount2022.balance) / LAMPORTS_PER_SOL).toFixed(9)}
                </h2>
                <div className="col-span-2 text-sm truncate text-gray-500">{splAccount2022.ata}</div>
              </div>
              <div className="p-6">
                <div className="col-span-1 w-full">
                  <input type="text" placeholder="Enter amount" className="input input-bordered w-full mb-2" disabled={!publicKey} />
                  <button className="btn btn-outline btn-sm ">Not Supported by zK</button>
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-row-7-subgrid gap-2 pb-2">
            {splAccounts2022?.map((splAccount2022: { ata: string; mint: string; balance: string }) => (
              <div key={splAccount2022.mint} className="contents">
                <div className="col-span-2 text-sm">{splAccount2022.ata}</div>
                <div className="col-span-1 badge badge-neutral">Token 2022</div>
                <div className="col-span-2 text-sm">{splAccount2022.mint}</div>
                <div className="col-span-1">{splAccount2022.balance}</div>
                <div className="col-span-1">
                  <button className="btn btn-outline btn-sm ">Not Supported</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TransactionsProps {
  transactions: ParsedTransactionWithMeta[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  return (
    <div className="flex flex-col ">
      <div className="grid grid-cols-8 text-sm font-bold">
        <div className="col-span-2">Block Time:</div>
        <div className="col-span-5">Transaction Signature</div>
        <div className="col-span-1 text-right">Fee</div>
      </div>
      <div>
        {transactions.map((transaction, index) => (
          <div className="grid grid-cols-8 text-sm pb-2 pt-2 hover:bg-gray-100" key={index}>
            <div className="col-span-2">{new Date(transaction.blockTime! * 1000).toUTCString()}</div>
            <div className="col-span-5 truncate">{JSON.stringify(transaction.transaction.signatures[0])}</div>
            <div className="col-span-1 text-right">{Number(JSON.stringify(transaction.meta?.fee)) / LAMPORTS_PER_SOL}</div>
          </div>
        ))}
      </div>
      <div className="join pt-6 ">
        <button className="join-item btn">1</button>
        <button className="join-item btn ">2</button>
        <button className="join-item btn">3</button>
        <button className="join-item btn">4</button>
        <button className="join-item btn">Load More</button>
      </div>
    </div>
  );
};
