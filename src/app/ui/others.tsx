"use client";
const data = [
    {
        title: "Upgrade ORE",
        body: "Upgrade your OREv1 tokens to v2. This will burn your v1 tokens and mint an equal number of v2 tokens directly to your wallet.",
        link: "https://ore.xyz/upgrade",
        image: "/others/apps/ore.png"
    },
    {
        title: "Jupiter Swap",
        body: "Swap tokens on Jupiter",
        link: "https://jup.ag/",
        image: "/others/apps/jup.avif"
    },
    {
        title: "Drift earn",
        body: "Deposit USDC into Drift and earn 5.90% APR",
        link: "https://drift.trade/earn",
        image: "/others/apps/driftearn.webp"
    },
    {
        title: "Sanctum",
        body: "Sanctum is a platform for creating and trading synthetic assets on Solana. Buy hSOL with SOL",
        link: "https://sanctum.so/",
        image: "/others/apps/sanctum.avif"
    },
    {
        title: "All Domains",
        body: "Buy .LetsBONK domains, using $BONK, earn points and compete in our leaderboard. Enter domain name in the field below. ",
        link: "https://alldomains.io/",
        image: "/others/apps/alldomains.png"
    },
    {
        title: "Helius",
        body: "The LST of Helius, the leading developer platform on Solana",
        link: "https://helius.io/",
        image: "/others/apps/heliusLST.avif"
    },
    {
        title: "Circut",
        body: "Deposit USDC into Supercharger Vault 22% APY)",
        link: "https://circut.finance/",
        image: "/others/apps/circut.webp"
    },
    {
        title: "Sunrise Stake",
        body: "Offset your carbon footprint by staking with Sunrise Stake",
        link: "https://sunrisestake.com/",
        image: "/others/apps/sunrisestake.png"
    },
    {
        title: "bonk.sol",
        body: "Buy a .bonk domain, using SOL, to get a free .bonk domain",
        link: "https://bonk.sol/",
        image: "/others/apps/alldomains.png"
    },
    {
        title: "Lulo",
        body: "The Modern Way To Grow Your Wealth Deposit and begin earning today",
        link: "https://lulo.finance/",
        image: "/others/apps/lulo.gif"
    },
    {
        title: "helium",
        body: "People-Powered Networks. Start a Wireless Revolution",
        link: "https://helium.com/",
        image: "/others/apps/helium.avif"
    }, {
        title: "Access Protocol",
        body: "Access Protocol offers a new model monetization layer for all digital content creators.",
        link: "https://accessprotocol.com/",
        image: "/others/apps/accessprotocol.avif"
    }, {
        title: "Netrunner",
        body: "portfolio management and tax reporting for NFT and Defi traders on Solana",
        link: "https://netrunner.so/",
        image: "/others/apps/netrunner.webp"
    }
]


export default function Others() {
    const randomItems = data.sort(() => 0.5 - Math.random()).slice(0, 4);
    // todo update to return based on accounts contents 
    // mint, type (token or spl), amount, across devnet and mainnet 
    // configure based on the account contents into predetermined user types 
    // display relevant content based on the user type 

    return (
        <div>
            <div className="">
                <div className="">
                    <h2 className="text-center text-base/7 font-semibold text-primary">Explore Solana</h2>
                    <p className="mx-auto mt-2 max-w-xl text-pretty text-center text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">Discover Solana dApps tailored to your account</p>

                    <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
                        <div className="relative lg:row-span-2">
                            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>

                            <div className="relative flex  flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)] sm:pb-4">
                                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                                    <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">{randomItems[0].title}</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">{randomItems[0].body}</p>
                                </div>
                                <div className="relative  w-full  [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                                    <img className=" object-fit object-top p-8" src={randomItems[0].image} alt="" />
                                </div>
                            </div>

                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem] "></div>
                        </div>
                        <div className="relative max-lg:row-start-1 sm:pb-4">
                            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
                            <div className="relative flex  flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                    <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">{randomItems[1].title}</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">{randomItems[1].body}</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center underline pb-6">{randomItems[1].link}</p>
                                </div>

                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]"></div>
                        </div>
                        <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2 ">
                            <div className="absolute inset-px rounded-lg bg-white"></div>
                            <div className="relative flex  flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                                <div className="px-8 pt-8 sm:px-10 sm:pt-10 ">
                                    <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">{randomItems[2].title}</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">{randomItems[2].body}</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center underline pb-6 " >{randomItems[2].link}</p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
                        </div>
                        <div className="relative lg:row-span-2">
                            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem] "></div>
                            <div className="relative flex  flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                                    <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">{randomItems[3].title}</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">{randomItems[3].body}</p>
                                </div>
                                <div className="relative w-full [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                                    <img className=" object-fit object-top p-8 xs:pb-4" src={randomItems[3].image} alt="" />
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}