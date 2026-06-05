const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const colors = ['#ff3366', '#33ccff', '#33ff66', '#ffcc00'];

let scale = 0.5; 
let offsetX = window.innerWidth / 2;
let offsetY = window.innerHeight / 2;

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

canvas.addEventListener('mousedown', (e) => {
	isDragging = true;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
	if (!isDragging) return;
	offsetX += e.clientX - lastMouseX;
	offsetY += e.clientY - lastMouseY;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('wheel', (e) => {
	e.preventDefault(); 
	const zoomIntensity = 0.1;
	const wheel = e.deltaY < 0 ? 1 : -1;
	const zoomFactor = Math.exp(wheel * zoomIntensity);

	const mouseX = e.clientX;
	const mouseY = e.clientY;

	const worldX = (mouseX - offsetX) / scale;
	const worldY = (mouseY - offsetY) / scale;

	scale *= zoomFactor;

	offsetX = mouseX - worldX * scale;
	offsetY = mouseY - worldY * scale;
}, { passive: false });

async function initWasm() {
	const response = await fetch('main.wasm');
	const bytes = await response.arrayBuffer();
	const { instance } = await WebAssembly.instantiate(bytes);

	const wasm = instance.exports;

	wasm.init(BigInt(Math.floor(Math.random() * 1000000)));

	function loop() {
		wasm.step();

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.translate(offsetX, offsetY);
		ctx.scale(scale, scale);

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
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
		requestAnimationFrame(loop);
	}

	loop();
}

initWasm().catch(console.error);
