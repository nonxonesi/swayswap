use fuel_tx::Salt;
use fuels_abigen_macro::abigen;
use fuels_contract::contract::Contract;
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};

// Generate Rust bindings from our contract JSON ABI
// FIXME: Incorrect path, see https://github.com/FuelLabs/fuels-rs/issues/94
abigen!(SwaySwap, "./swaySwapABI.json");

#[tokio::test]
async fn harness() {

    // Build the contract
    let rng = &mut StdRng::seed_from_u64(2322u64);
    let salt: [u8; 32] = rng.gen();
    let salt = Salt::from(salt);
    let swayswap_compiled = Contract::compile_sway_contract("./src/main.sw", salt).unwrap();

    // Launch a local network and deploy the contract
    let (client, swapswap_contract_id) = Contract::launch_and_deploy(&swayswap_compiled).await.unwrap();

    println!("Deployments:");
    println!("{}", swapswap_contract_id);

    let sway_swap = SwaySwap::new(swayswap_compiled, client);

    // Check output amounts calculation
    let initial_reserve_a = 10_000_000;
    let initial_reserve_b = 10_000_000;
    let amount_in = 10_000;


    // Get current pool "midpoint"
    let midpoint = initial_reserve_b as f64 / initial_reserve_a as f64;

    let result = sway_swap
    .input_price(
        InputPriceParam {
            input_amount: amount_in,
            input_reserve: initial_reserve_a,
            output_reserve : initial_reserve_b
        }
    )
    .call()
    .await
    .unwrap();

    // Calculate slippage from amount out
    let price_realized = result.value as f64 / amount_in as f64;
    let slippage_pct = 100. * (1. - (price_realized / midpoint));
    println!("Trading {} results in {:.2}% slippage", amount_in, slippage_pct);
    


}