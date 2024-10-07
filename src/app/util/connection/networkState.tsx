"use client"

import { useState } from "react";

export default function NetworkSwitcher() {

  const [network, setNetwork] = useState("devnet");


  return(
    <div>
      <select className="select select-bordered w-full max-w-xs mr-4" onChange={(e) => setNetwork(e.target.value)}>
        <option value="devnet">Devnet</option>
        <option value="mainnet">Mainnet</option>
      </select>
      {network}
    </div>
  )
}