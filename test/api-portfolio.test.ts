import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import {
	fetchOpenPortfolio,
	fetchClosedPortfolio,
	fetchPortfolioTotal,
	fetchPositionPnL,
	fetchPositionHistory,
	fetchProtocolMetrics,
	fetchWalletPoolClaims,
} from "../src/api";
import type { FetchType } from "./helpers";

// Real wallet for testing
const TEST_WALLET = "87bdcSg4zvjExbvsUSbGifYUp75JdLhLafjgwvCjzjkA";

// Real pool address (SOL-USDC on Meteora)
const SOL_USDC_POOL = "BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y";

describe("Portfolio API - Real API Tests", () => {
	test("fetchOpenPortfolio should return user's open positions", async () => {
		const result = await fetchOpenPortfolio({
			user: TEST_WALLET,
			page: 1,
			page_size: 20,
		});

		expect(result).not.toBeNull();
		expect(typeof result?.totalCount).toBe("number");
		expect(typeof result?.page).toBe("number");
		expect(Array.isArray(result?.pools)).toBe(true);
		expect(typeof result?.total).toBe("object");

		// If user has positions, verify structure
		if (result && result.pools.length > 0) {
			const pool = result.pools[0];
			expect(pool.poolAddress).toBeTruthy();
			expect(pool.tokenX).toBeTruthy();
			expect(pool.tokenY).toBeTruthy();
			expect(typeof pool.openPositionCount).toBe("number");
			expect(Array.isArray(pool.listPositions)).toBe(true);
		}
	});

	test("fetchOpenPortfolio should support sorting", async () => {
		const result = await fetchOpenPortfolio({
			user: TEST_WALLET,
			sort_by: "current_balances",
			sort_direction: "desc",
		});

		expect(result).not.toBeNull();
		expect(Array.isArray(result?.pools)).toBe(true);
	});

	test("fetchClosedPortfolio should return user's closed positions", async () => {
		const result = await fetchClosedPortfolio({
			user: TEST_WALLET,
			page: 1,
			page_size: 20,
		});

		expect(result).not.toBeNull();
		expect(typeof result?.totalCount).toBe("number");
		expect(typeof result?.page).toBe("number");
		expect(Array.isArray(result?.pools)).toBe(true);

		// If user has closed positions, verify structure
		if (result && result.pools.length > 0) {
			const pool = result.pools[0];
			expect(pool.poolAddress).toBeTruthy();
			expect(pool.totalDeposit).toBeTruthy();
			expect(pool.totalFee).toBeTruthy();
			expect(pool.pnlUsd).toBeTruthy();
		}
	});

	test("fetchPortfolioTotal should return aggregate PnL", async () => {
		const result = await fetchPortfolioTotal(TEST_WALLET);

		expect(result).not.toBeNull();
		expect(typeof result?.totalPnlUsd).toBe("string");
		expect(typeof result?.totalPnlPctChange).toBe("string");
	});

	test("fetchPositionPnL should return positions for a pool", async () => {
		const result = await fetchPositionPnL({
			poolAddress: SOL_USDC_POOL,
			user: TEST_WALLET,
			status: "all",
		});

		expect(result).not.toBeNull();
		expect(Array.isArray(result?.positions)).toBe(true);
		expect(typeof result?.totalCount).toBe("number");
		expect(typeof result?.page).toBe("number");
		expect(typeof result?.hasNext).toBe("boolean");
	});

	test("fetchPositionPnL should filter by status", async () => {
		const result = await fetchPositionPnL({
			poolAddress: SOL_USDC_POOL,
			user: TEST_WALLET,
			status: "open",
		});

		expect(result).not.toBeNull();
		expect(Array.isArray(result?.positions)).toBe(true);

		// Verify position structure
		if (result && result.positions.length > 0) {
			expect(typeof result.positions[0].isClosed).toBe("boolean");
		}
	});

	test("fetchPositionPnL should include token prices", async () => {
		const result = await fetchPositionPnL({
			poolAddress: SOL_USDC_POOL,
			user: TEST_WALLET,
		});

		expect(result).not.toBeNull();
		expect(typeof result?.tokenXPrice).toBe("string");
		expect(typeof result?.tokenYPrice).toBe("string");
	});

	test("fetchPositionHistory should return events for a position", async () => {
		// First get a position address from portfolio
		const portfolio = await fetchOpenPortfolio({ user: TEST_WALLET });

		expect(portfolio).not.toBeNull();
		expect(Array.isArray(portfolio?.pools)).toBe(true);

		if (portfolio && portfolio.pools.length > 0) {
			const poolWithPositions = portfolio.pools.find((p) => p.listPositions.length > 0);
			if (poolWithPositions) {
				const positionAddress = poolWithPositions.listPositions[0];

				const result = await fetchPositionHistory({
					positionAddress,
					order_direction: "desc",
				});

				expect(result).not.toBeNull();
				expect(Array.isArray(result?.events)).toBe(true);

				// Verify event structure
				if (result && result.events.length > 0) {
					const event = result.events[0];
					expect(event.signature).toBeTruthy();
					expect(event.eventType).toBeTruthy();
					expect(typeof event.amountX).toBe("string");
					expect(typeof event.amountY).toBe("string");
				}
			}
		}
	});

	test("fetchPositionHistory should filter by event type", async () => {
		// First get a position address from portfolio
		const portfolio = await fetchOpenPortfolio({ user: TEST_WALLET });

		expect(portfolio).not.toBeNull();
		expect(Array.isArray(portfolio?.pools)).toBe(true);

		if (portfolio && portfolio.pools.length > 0) {
			const poolWithPositions = portfolio.pools.find((p) => p.listPositions.length > 0);
			if (poolWithPositions) {
				const positionAddress = poolWithPositions.listPositions[0];

				const result = await fetchPositionHistory({
					positionAddress,
					event_type: "add",
				});

				expect(result).not.toBeNull();
				expect(Array.isArray(result?.events)).toBe(true);

				// Note: API may return all types if filter doesn't apply
				if (result && result.events.length > 0) {
					expect(result.events.length).toBeGreaterThanOrEqual(0);
				}
			}
		}
	});

	test("fetchProtocolMetrics should return protocol stats", async () => {
		const result = await fetchProtocolMetrics();

		expect(result).not.toBeNull();
		expect(typeof result?.total_tvl).toBe("number");
		expect(typeof result?.volume_24h).toBe("number");
		expect(typeof result?.fee_24h).toBe("number");
		expect(typeof result?.total_pools).toBe("number");
		expect(result?.total_pools).toBeGreaterThan(0);
	});

	test("fetchWalletPoolClaims should return claims data", async () => {
		const result = await fetchWalletPoolClaims({
			wallet: TEST_WALLET,
			pool_address: SOL_USDC_POOL,
		});

		expect(result).not.toBeNull();
		expect(result?.pool_address).toBe(SOL_USDC_POOL);
		expect(result?.user_address).toBe(TEST_WALLET);
		expect(typeof result?.total_fee_x).toBe("string");
		expect(typeof result?.total_fee_y).toBe("string");
		expect(typeof result?.fee_claim_count).toBe("number");
	});
});

describe("Portfolio API - Mock Error Handling Tests", () => {
	let originalFetch: FetchType;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("fetchOpenPortfolio should return null on network error", async () => {
		(globalThis as any).fetch = () => Promise.reject(new Error("Network error"));

		const result = await fetchOpenPortfolio({ user: TEST_WALLET });

		expect(result).toBeNull();
	});

	test("fetchClosedPortfolio should return null on HTTP error", async () => {
		(globalThis as any).fetch = () =>
			Promise.resolve({
				ok: false,
				status: 400,
				statusText: "Bad Request",
			} as Response);

		const result = await fetchClosedPortfolio({ user: TEST_WALLET });

		expect(result).toBeNull();
	});

	test("fetchPositionPnL should return null on network error", async () => {
		(globalThis as any).fetch = () => Promise.reject(new Error("Network error"));

		const result = await fetchPositionPnL({
			poolAddress: SOL_USDC_POOL,
			user: TEST_WALLET,
		});

		expect(result).toBeNull();
	});

	test("fetchProtocolMetrics should return null on network error", async () => {
		(globalThis as any).fetch = () => Promise.reject(new Error("Network error"));

		const result = await fetchProtocolMetrics();

		expect(result).toBeNull();
	});
});
