use fuel_tx::Salt;
use fuels_abigen_macro::abigen;
use fuels_contract::contract::Contract;
use fuels_contract::script::Script;

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
mod mint;

// Generate Rust bindings from our contract JSON ABI
// FIXME: Incorrect path, see https://github.com/FuelLabs/fuels-rs/issues/94
abigen!(SwaySwap, "./swaySwapABI.json");

#[tokio::test]
async fn harness() {

    let recompile = 3;

    // Build the contract
    let rng = &mut StdRng::seed_from_u64(2322u64);
    let salt: [u8; 32] = rng.gen();
    let salt = Salt::from(salt);
    let swayswap_compiled = Contract::compile_sway_contract("./", salt).unwrap();

    // Launch a local network and deploy the contract
    let (client, swapswap_contract_id) = Contract::launch_and_deploy(&swayswap_compiled).await.unwrap();

    println!("Deployments:");
    println!("{}", swapswap_contract_id);

    let sway_swap = SwaySwap::new(swayswap_compiled, client.clone());

    // Check output amounts calculation

    let reserve_a = 100_000;
    let reserve_b = 100_000;
    let amount_in = 10_000;


    // Get current pool "midpoint"
    let midpoint = reserve_b as f64 /reserve_a as f64;

    let result = sway_swap
    .input_price(
        InputPriceParam {
            input_amount: amount_in,
            input_reserve: reserve_a,
            output_reserve : reserve_b
        }
    )
    .call()
    .await
    .unwrap();
    

    // Calculate slippage from amount out
    let amount_out = result.value;
    let price_realized = amount_out as f64 / (amount_in) as f64;
    let slippage_pct = 100. * (1. - (price_realized / midpoint));
    println!("Swapped {} for {} in pool with reserves of {}/{}, resulting in {:.2}% slippage", amount_in, amount_out, reserve_a, reserve_b, slippage_pct);


    //
    let script = mint::mint_script();
    let result = script.call(&client).await.unwrap();

    let eth_reserves = sway_swap
    .get_eth_reserves()
    .call()
    .await
    .unwrap();
    println!("{}", eth_reserves.value);

    let token_reserves = sway_swap
    .get_token_reserves()
    .call()
    .await
    .unwrap();
    println!("{}", token_reserves.value);
}