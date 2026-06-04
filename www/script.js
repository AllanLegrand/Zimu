const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colors = ['#ff3366', '#33ccff', '#33ff66', '#ffcc00'];

async function init() {
	const response = await fetch('main.wasm');
	const bytes = await response.arrayBuffer();
	const { instance } = await WebAssembly.instantiate(bytes);

	const wasm = instance.exports;

	wasm.init(BigInt(Math.floor(Math.random() * 1000000)));

	function loop() {
		wasm.step();

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const count = wasm.get_count();
		const ptr = wasm.get_particles();

		const floats = new Float32Array(wasm.memory.buffer, ptr, count * 5);
		const ints = new Int32Array(wasm.memory.buffer, ptr, count * 5);

		for (let i = 0; i < count; i++) {
			const idx = i * 5;
			const x = floats[idx];
			const y = floats[idx + 1];
			const kind = ints[idx + 4];

			ctx.fillStyle = colors[kind];
			ctx.beginPath();
			ctx.arc(x, y, 2.5, 0, Math.PI * 2);
			ctx.fill();
		}

		requestAnimationFrame(loop);
	}

	loop();
}

init().catch(console.error);

