import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { fetchPools, fetchPool, fetchPoolOHLCV, getLatestOHLCVCandle, fetchVolumeHistory, fetchGroups } from "../src/api";
import type { FetchType } from "./helpers";

// Real pool address (SOL-USDC on Meteora)
const SOL_USDC_POOL = "BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y";

describe("Pool API - Real API Tests", () => {
	test("fetchPools should return paginated pools", async () => {
		const result = await fetchPools({ page: 1, page_size: 5 });

		expect(result).not.toBeNull();
		expect(result?.data.length).toBeGreaterThan(0);
		expect(result?.data.length).toBeLessThanOrEqual(5);
		expect(typeof result?.total).toBe("number");
		expect(typeof result?.pages).toBe("number");
		expect(result?.data[0]?.address).toBeTruthy();
		expect(result?.data[0]?.name).toBeTruthy();
	});

	test("fetchPools should filter by query", async () => {
		const result = await fetchPools({ query: "SOL", page_size: 10 });

		expect(result).not.toBeNull();
		// Results should contain SOL-related pools
		if (result && result.data.length > 0) {
			const hasSol = result.data.some(
				(pool) =>
					pool.token_x.symbol.includes("SOL") ||
					pool.token_y.symbol.includes("SOL"),
			);
			expect(hasSol).toBe(true);
		}
	});

	test("fetchPools should sort by TVL", async () => {
		const result = await fetchPools({ sort_by: "tvl:desc", page_size: 5 });

		expect(result).not.toBeNull();
		expect(result?.data.length).toBeGreaterThan(1);

		// First pool should have higher or equal TVL than second
		if (result && result.data.length >= 2) {
			expect(result.data[0].tvl).toBeGreaterThanOrEqual(result.data[1].tvl);
		}
	});

	test("fetchPool should return single pool details", async () => {
		const result = await fetchPool(SOL_USDC_POOL);

		expect(result).not.toBeNull();
		expect(result?.address).toBe(SOL_USDC_POOL);
		expect(result?.name).toBeTruthy();
		expect(result?.tvl).toBeGreaterThan(0);
		expect(result?.pool_config.bin_step).toBeGreaterThanOrEqual(0);
	});

	test("fetchPool should return null for invalid address", async () => {
		const result = await fetchPool("invalid_address_123");

		// API returns 400 for invalid address
		expect(result).toBeNull();
	});

	test("fetchPoolOHLCV should return candle data", async () => {
		const result = await fetchPoolOHLCV({
			poolAddress: SOL_USDC_POOL,
			timeframe: "1h",
		});

		expect(result).not.toBeNull();
		expect(result?.data.length).toBeGreaterThan(0);
		expect(result?.data[0].open).toBeGreaterThan(0);
		expect(result?.data[0].high).toBeGreaterThanOrEqual(result?.data[0].low);
	});

	test("fetchPoolOHLCV should respect time range", async () => {
		const now = Math.floor(Date.now() / 1000);
		const dayAgo = now - 86400;

		const result = await fetchPoolOHLCV({
			poolAddress: SOL_USDC_POOL,
			timeframe: "1h",
			start_time: dayAgo,
			end_time: now,
		});

		expect(result).not.toBeNull();
		if (result && result.data.length > 0) {
			// API returns candles on hour boundaries, so check last candle is within range
			const lastCandle = result.data[result.data.length - 1];
			expect(lastCandle.timestamp).toBeLessThanOrEqual(now);
			expect(lastCandle.timestamp).toBeGreaterThanOrEqual(dayAgo - 3600); // Allow 1h buffer
		}
	});

	test("getLatestOHLCVCandle should return last candle", () => {
		const result = getLatestOHLCVCandle({
			start_time: 0,
			end_time: 0,
			timeframe: null,
			data: [
				{ timestamp: 1, timestamp_str: "1", open: 100, high: 105, low: 98, close: 102, volume: 1000 },
				{ timestamp: 2, timestamp_str: "2", open: 102, high: 108, low: 101, close: 106, volume: 1500 },
			],
		});

		expect(result).not.toBeNull();
		expect(result?.close).toBe(106);
	});

	test("getLatestOHLCVCandle should return null for empty data", () => {
		const result = getLatestOHLCVCandle({
			start_time: 0,
			end_time: 0,
			timeframe: null,
			data: [],
		});

		expect(result).toBeNull();
	});

	test("fetchVolumeHistory should return volume data", async () => {
		const result = await fetchVolumeHistory({
			poolAddress: SOL_USDC_POOL,
			timeframe: "24h",
		});

		expect(result).not.toBeNull();
		expect(result?.data.length).toBeGreaterThan(0);
		expect(result?.data[0].volume).toBeGreaterThanOrEqual(0);
		expect(result?.data[0].fees).toBeGreaterThanOrEqual(0);
	});

	test("fetchGroups should return pool groups", async () => {
		const result = await fetchGroups({ page: 1, page_size: 5 });

		expect(result).not.toBeNull();
		expect(result?.data.length).toBeGreaterThan(0);
		expect(result?.data[0]?.group_name).toBeTruthy();
		expect(result?.data[0]?.pool_count).toBeGreaterThan(0);
	});
});

describe("Pool API - Mock Error Handling Tests", () => {
	let originalFetch: FetchType;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("fetchPools should return null on network error", async () => {
		(globalThis as any).fetch = () => Promise.reject(new Error("Network error"));

		const result = await fetchPools();

		expect(result).toBeNull();
	});

	test("fetchPool should return null on HTTP error", async () => {
		(globalThis as any).fetch = () =>
			Promise.resolve({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			} as Response);

		const result = await fetchPool("some_address");

		expect(result).toBeNull();
	});

	test("fetchPoolOHLCV should return null on network error", async () => {
		(globalThis as any).fetch = () => Promise.reject(new Error("Network error"));

		const result = await fetchPoolOHLCV({ poolAddress: SOL_USDC_POOL });

		expect(result).toBeNull();
	});
});
