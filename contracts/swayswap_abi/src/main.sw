library swayswap_abi;

use std::contract_id::ContractId;
use std::collections::Vec;

pub struct Token {
    token: b256,
    ticker: u64,
    // Images are getted from static code please submit a PR on /public/asset/images
    // TODO: When storage start accepting String image will be a base64;
}

abi SwaySwap {
    /// Deposit coins for later adding to liquidity pool.
    fn add_token(token: b256);
    // Return a list of all tokens.
    fn list_tokens() -> [Token; 10];
}
