let wasm;

async function loadWasm() {
	const response = await fetch('main.wasm');
	const buffer = await response.arrayBuffer();
	const module = await WebAssembly.instantiate(buffer);
	wasm = module.instance.exports;
	console.log("Zig WASM loaded!");
}

async function calculate() {
	if (!wasm) {
		await loadWasm();
	}

	const a = parseInt(document.getElementById('a').value);
	const b = parseInt(document.getElementById('b').value);
	const result = wasm.add(a, b);

	document.getElementById('result').textContent = `${a} + ${b} = ${result}`;
}

loadWasm();
