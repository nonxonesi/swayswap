contract;

use std::{
    address::*,
    assert::require,
    context::{*, call_frames::*},
    contract_id::ContractId,
    storage::*,
    token::*,
};
use token_abi::Token;
use swayswap_helpers::{get_msg_sender_address_or_panic};

const ZERO_B256 = 0x0000000000000000000000000000000000000000000000000000000000000000;

storage {
    owner: Address,
    mint_amount: u64,
    mint_list: StorageMap<Address, bool>,
}

enum Error {
    AddressAlreadyMint: (),
    CannotReinitialize: (),
    MintIsClosed: (),
    NotOwner: (),
}

fn validate_owner() {
    let sender = get_msg_sender_address_or_panic();
    require(storage.owner == sender, Error::NotOwner);
}

impl Token for Contract {
    //////////////////////////////////////
    // Owner methods
    //////////////////////////////////////
    fn initialize(mint_amount: u64, address: Address) {
        require(storage.owner.into() == ZERO_B256, Error::CannotReinitialize);
        // Start the next message to be signed
        storage.owner = address;
        storage.mint_amount = mint_amount;
    }

    fn set_mint_amount(mint_amount: u64) {
        validate_owner();
        storage.mint_amount = mint_amount;
    }

    fn mint_coins(mint_amount: u64) {
        validate_owner();
        mint(mint_amount);
    }

    fn burn_coins(burn_amount: u64) {
        validate_owner();
        burn(burn_amount);
    }

    fn transfer_coins(coins: u64, address: Address) {
        validate_owner();
        transfer_to_output(coins, contract_id(), address);
    }

    fn transfer_token_to_output(coins: u64, asset_id: ContractId, address: Address) {
        validate_owner();
        transfer_to_output(coins, asset_id, address);
    }

    //////////////////////////////////////
    // Mint public method
    //////////////////////////////////////
    fn mint() {
        require(storage.mint_amount > 0, Error::MintIsClosed);

        // Enable a address to mint only once
        let sender = get_msg_sender_address_or_panic();
        require(storage.mint_list.get(sender) == false, Error::AddressAlreadyMint);

        storage.mint_list.insert(sender, true);
        mint_to_address(storage.mint_amount, sender);
    }

    //////////////////////////////////////
    // Read-Only methods
    //////////////////////////////////////
    fn get_mint_amount() -> u64 {
        storage.mint_amount
    }

    fn get_balance() -> u64 {
        balance_of(contract_id(), contract_id())
    }

    fn get_token_balance(asset_id: ContractId) -> u64 {
        balance_of(asset_id, contract_id())
    }
}
