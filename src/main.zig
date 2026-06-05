const std = @import("std");

pub const Particle = extern struct {
	x: f32,
	y: f32,
	vx: f32,
	vy: f32,
	kind: i32,
};

const num_particles = 1500;
const num_types = 4;
var particles: [num_particles]Particle = undefined;
var rules: [num_types][num_types]f32 = undefined;

const width: f32 = 800.0;
const height: f32 = 800.0;
const max_radius: f32 = 60.0;
const min_radius: f32 = 15.0;
const friction: f32 = 0.5;
const dt: f32 = 0.05;

var prng: std.Random.DefaultPrng = undefined;

export fn init(seed: u64) void {
	prng = std.Random.DefaultPrng.init(seed);
	const random = prng.random();

	for (0..num_types) |i| {
		for (0..num_types) |j| {
			rules[i][j] = (random.float(f32) * 2.0) - 1.0;
		}
	}

	for (0..num_particles) |i| {
		particles[i] = Particle{
			.x = random.float(f32) * width,
			.y = random.float(f32) * height,
			.vx = 0,
			.vy = 0,
			.kind = @as(i32, @intCast(i % num_types)),
		};
	}
}

export fn step() void {
	for (0..num_particles) |i| {
		var fx: f32 = 0;
		var fy: f32 = 0;
		const p1 = &particles[i];

		for (0..num_particles) |j| {
			if (i == j) continue;
			const p2 = &particles[j];

			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;


			const dist_sq = dx * dx + dy * dy;
			if (dist_sq > 0 and dist_sq < max_radius * max_radius) {
				const dist = @sqrt(dist_sq);
				var force: f32 = 0;

				if (dist < min_radius) {
					force = (dist / min_radius) - 1.0; 
				} else {
					const rule = rules[@as(usize, @intCast(p1.kind))][@as(usize, @intCast(p2.kind))];
					const normalized_dist = (dist - min_radius) / (max_radius - min_radius);
					force = rule * (1.0 - @abs(2.0 * normalized_dist - 1.0));
				}

				fx += (dx / dist) * force;
				fy += (dy / dist) * force;
			}
		}

		fx -= p1.x * 0.0001;
		fy -= p1.y * 0.0001;

		p1.vx = (p1.vx + fx * dt) * friction;
		p1.vy = (p1.vy + fy * dt) * friction;
	}

	for (0..num_particles) |i| {
		const p = &particles[i];
		p.x += p.vx;
		p.y += p.vy;

	}
}

export fn get_particles() [*]Particle {
	return &particles;
}

export fn get_count() i32 {
	return num_particles;
}
