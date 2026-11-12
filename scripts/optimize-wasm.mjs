import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import binaryen from "binaryen";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.resolve(
  __dirname,
  "../contracts-stellar/target/wasm32-unknown-unknown/release/spoovault_stellar.wasm"
);

console.log("Reading wasm from:", wasmPath);
const wasmBuffer = fs.readFileSync(wasmPath);
console.log(`Original size: ${wasmBuffer.length} bytes`);

const mod = binaryen.readBinary(wasmBuffer);
console.log("Features before:", mod.getFeatures());

// Soroban supported features:
// Keep all features EXCEPT ReferenceTypes (and Multivalue if not needed)
let features = mod.getFeatures();
features &= ~binaryen.Features.ReferenceTypes;
features &= ~binaryen.Features.Multivalue;
// Make sure BulkMemory has BulkMemoryOpt if set
if (features & binaryen.Features.BulkMemory) {
  features |= binaryen.Features.BulkMemoryOpt;
}

mod.setFeatures(features);
console.log("Features after disabling reference-types:", mod.getFeatures());

binaryen.setOptimizeLevel(2);
binaryen.setShrinkLevel(1);
mod.optimize();

const valid = mod.validate();
console.log("Module valid?", valid);

const optimized = mod.emitBinary();
console.log(`Optimized size: ${optimized.length} bytes`);

fs.writeFileSync(wasmPath, optimized);
console.log("Successfully wrote optimized WASM to disk!");
mod.dispose();
