// import { Rpc,  createRpc,} from "@lightprotocol/stateless.js";



// export default async function getConnection(network: string) {
//     let RPC_ENDPOINT = "";

//     const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
//     const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT)
    
//     let slot = await connection.getSlot();
//     console.log(slot);
    
//     let health = await connection.getIndexerHealth();
//     console.log(health);
//     // "Ok"
//     return connection;
// }