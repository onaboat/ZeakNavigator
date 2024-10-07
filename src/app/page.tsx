"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {

  const [search, setSearch] = useState("");
  const router = useRouter();
  // push search to /account/search
  const handleSearch = () => {
    router.push(`/account/${search}`);
  };

  // on return key press, handle search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <div className="container mx-auto" style={{ height: "calc(100vh - 65px)" }}>
      <main className="flex flex-col justify-center  gap-4 h-full -mt-20">
        <div className="flex flex-col items-center justify-between gap-2">
          <div className="">
            <img src="solanaLogoMark.svg" alt="solanaLogo" className="w-6 h-6" />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <div >
              <img src="Logo.svg" alt="logo" className="w-9 h-9" />
            </div>
            <div className="">
              <h1 className="text-2xl font-bold ">Zeak Navigator </h1>
              <p className="text-xs font-bold ">ZK Compression Explorer </p>
            </div>
          </div>
        </div>
        <div className="inputSearch">
          <label className="input input-bordered input-primary  flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70">
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd" />
            </svg>
            <input type="text" className="grow text-1xl " placeholder="Seach by wallet address" onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyPress} />
          </label>
          <button className="btn btn-primary w-full mt-2 text-2xl" onClick={handleSearch}>Go</button>
        </div>
      </main>
    </div>
  );
}
