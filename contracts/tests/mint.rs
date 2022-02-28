// Leverages the fact that VM doesn't check UTXO set yet to mint arbitary tokens via unchecked coin UTXO inputs
use fuel_tx::*;
use fuels_contract::script::Script;


pub fn mint_script() -> Script {

    // Create some coin inputs and outputs to receiver address

    let tx = Transaction::Script {
        gas_price: 0,
        gas_limit: 1_000_000,
        byte_price: 0,
        maturity: 0,
        receipts_root: Default::default(),
        script: vec![],
        script_data: vec![],
        inputs: vec![],
        outputs: vec![],
        witnesses: vec![vec![].into()],
        metadata: None,
    };

    Script::new(tx)
}
