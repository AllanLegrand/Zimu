const std = @import("std");

pub fn build(b: *std.Build) void {
	const target = b.standardTargetOptions(.{
		.default_target = std.Target.Query{
			.cpu_arch = .wasm32,
			.os_tag = .freestanding,
		},
		});

	const wasm_mod = b.createModule(.{
		.root_source_file = b.path("src/main.zig"),
		.target = target,
	});

	const exe = b.addExecutable(.{
		.name = "main",
		.root_module = wasm_mod,
	});

	exe.entry = .disabled;
	exe.rdynamic = true;

	b.installArtifact(exe);
}
