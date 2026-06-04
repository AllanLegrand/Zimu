const std = @import("std");

export fn add(a: i32, b: i32) i32 {
	return a + b;
}

export fn greet(name_ptr: [*]const u8, name_len: usize) void {
	_ = name_ptr;
	_ = name_len;
}

export fn alloc(size: usize) ?[*]u8 {
	const slice = std.heap.page_allocator.alloc(u8, size) catch return null;
	return slice.ptr;
}

export fn dealloc(ptr: [*]u8, size: usize) void {
	std.heap.page_allocator.free(ptr[0..size]);
}
