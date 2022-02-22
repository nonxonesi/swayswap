use fuel_tx::Salt;
use fuels_abigen_macro::abigen;
use fuels_contract::contract::Contract;
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};

// Generate Rust bindings from our contract JSON ABI
// FIXME: Incorrect path, see https://github.com/FuelLabs/fuels-rs/issues/94
abigen!(MyContract, "./swaySwapABI.json");

#[tokio::test]
async fn harness() {

    
    // Build the contract
    let rng = &mut StdRng::seed_from_u64(2322u64);
    let salt: [u8; 32] = rng.gen();
    let salt = Salt::from(salt);
    let compiled = Contract::compile_sway_contract("./", salt).unwrap();

    // Launch a local network and deploy the contract
    let (client, _contract_id) = Contract::launch_and_deploy(&compiled).await.unwrap();

    let contract_instance = MyContract::new(compiled, client);


    let initial_reserve_a = 10_000;
    let initial_reserve_b = 10_000;
    let amount_in = 50;

    let midpoint = initial_reserve_a as f64 / initial_reserve_b as f64;

    let result = contract_instance
    .input_price(
        InputPriceParam{
            input_amount: amount_in,
            input_reserve: initial_reserve_a,
            output_reserve : initial_reserve_b
        }
    )
    .call()
    .await
    .unwrap();

    let price_realized = result.value as f64 / amount_in as f64;

    let slippage_pct = 100. * (1. - (price_realized / midpoint));

    println!("Trading {} results in {:.2}% slippage", amount_in, slippage_pct);
    


}