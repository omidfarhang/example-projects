use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn format_message(input: &str) -> String {
    format!("{} -> formatted by Rust", input)
}
