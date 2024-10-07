"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 p-4">
      <div className="flex-1">
        <a href="/">
          <img src="/Logo.svg" alt="Logo" width={40} height={40} className="fill-current" />
        </a>
      </div>

      <div>
        <select className="select select-bordered w-full max-w-xs mr-4" >
          <option value="devnet">Devnet</option>
          <option disabled value="mainnet">Mainnet</option>
        </select>
      </div>
      <div className="flex-none">
        <WalletMultiButton />
      </div>
    </div>
  );
}


