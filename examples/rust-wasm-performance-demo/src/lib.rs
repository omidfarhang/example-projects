use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sum_squares(n: u32) -> f64 {
    let mut total = 0.0;
    for i in 0..n {
        let value = i as f64;
        total += value * value;
    }
    total
}
