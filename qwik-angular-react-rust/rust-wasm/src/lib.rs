use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn analyze_message(input: &str) -> String {
    let chars = input.chars().count();
    let words = input.split_whitespace().count();
    let checksum = input.bytes().fold(0u32, |acc, byte| acc.wrapping_add(byte as u32));

    format!("{chars} chars - {words} words - checksum {checksum}")
}

#[wasm_bindgen]
pub fn count_primes(limit: u32) -> u32 {
    if limit < 2 {
        return 0;
    }

    let limit = limit as usize;
    let mut sieve = vec![true; limit + 1];
    sieve[0] = false;
    sieve[1] = false;

    let mut count = 0;

    for number in 2..=limit {
        if !sieve[number] {
            continue;
        }

        count += 1;

        let mut multiple = number * number;
        while multiple <= limit {
            sieve[multiple] = false;
            multiple += number;
        }
    }

    count
}
