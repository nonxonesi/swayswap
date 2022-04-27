contract;

use std::{address::*, assert::assert, block::*, chain::auth::*, context::{*, call_frames::*}, contract_id::ContractId, hash::*, panic::panic, storage::*, token::*};
use std::result::*;
use swayswap_abi::{SwaySwap, Token};

// storage {
//     data: [Token; 200]
// }

// ////////////////////////////////////////
// // ABI definitions
// ////////////////////////////////////////

impl SwaySwap for Contract {
    /// Deposit coins for later adding to liquidity pool.
    fn add_token(token: b256) {
        
    }

    // fn add_liquidity(min_liquidity: u64, max_tokens: u64, deadline: u64) -> u64 {
    // }
    // Return a list of all tokens.
    fn list_tokens() -> [Token] {
        [Token]
    } 
}
