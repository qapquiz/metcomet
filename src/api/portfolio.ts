import type {
	ClosedPortfolioResponse,
	FetchClosedPortfolioParams,
	OpenPortfolioResponse,
	FetchOpenPortfolioParams,
	PortfolioTotalResponse,
	PositionPnLResponse,
	FetchPositionPnLParams,
	PositionHistoryResponse,
	FetchPositionHistoryParams,
	ProtocolMetricsResponse,
	WalletTotalClaimsResponse,
	FetchWalletPoolClaimsParams,
} from "./types";

const BASE_URL = "https://dlmm.datapi.meteora.ag";

// ============================================================
// Portfolio Endpoints
// ============================================================

async function fetchClosedPortfolio(params: FetchClosedPortfolioParams): Promise<ClosedPortfolioResponse | null> {
	const { user, page = 1, page_size = 20, days_back = 120 } = params;
	const url = new URL(`${BASE_URL}/portfolio`);

	url.searchParams.set("user", user);
	url.searchParams.set("page", String(page));
	url.searchParams.set("page_size", String(page_size));
	url.searchParams.set("days_back", String(days_back));

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch closed portfolio: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as ClosedPortfolioResponse;
	} catch (error) {
		console.error(`Failed to fetch closed portfolio: ${error}`);
		return null;
	}
}

async function fetchOpenPortfolio(params: FetchOpenPortfolioParams): Promise<OpenPortfolioResponse | null> {
	const { user, page = 1, page_size = 20, sort_by, sort_direction } = params;
	const url = new URL(`${BASE_URL}/portfolio/open`);

	url.searchParams.set("user", user);
	url.searchParams.set("page", String(page));
	url.searchParams.set("page_size", String(page_size));
	if (sort_by) url.searchParams.set("sort_by", sort_by);
	if (sort_direction) url.searchParams.set("sort_direction", sort_direction);

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch open portfolio: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as OpenPortfolioResponse;
	} catch (error) {
		console.error(`Failed to fetch open portfolio: ${error}`);
		return null;
	}
}

async function fetchPortfolioTotal(user: string): Promise<PortfolioTotalResponse | null> {
	const url = `${BASE_URL}/portfolio/total?user=${encodeURIComponent(user)}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`Failed to fetch portfolio total: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as PortfolioTotalResponse;
	} catch (error) {
		console.error(`Failed to fetch portfolio total: ${error}`);
		return null;
	}
}

// ============================================================
// Position Endpoints
// ============================================================

async function fetchPositionPnL(params: FetchPositionPnLParams): Promise<PositionPnLResponse | null> {
	const { poolAddress, user, status = "all", page = 1, page_size = 20 } = params;
	const url = new URL(`${BASE_URL}/positions/${poolAddress}/pnl`);

	url.searchParams.set("user", user);
	url.searchParams.set("status", status);
	url.searchParams.set("page", String(page));
	url.searchParams.set("page_size", String(page_size));

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch position PnL: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as PositionPnLResponse;
	} catch (error) {
		console.error(`Failed to fetch position PnL: ${error}`);
		return null;
	}
}

async function fetchPositionHistory(params: FetchPositionHistoryParams): Promise<PositionHistoryResponse | null> {
	const { positionAddress, event_type, order_direction = "desc" } = params;
	const url = new URL(`${BASE_URL}/positions/${positionAddress}/historical`);

	if (event_type) url.searchParams.set("event_type", event_type);
	url.searchParams.set("order_direction", order_direction);

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch position history: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as PositionHistoryResponse;
	} catch (error) {
		console.error(`Failed to fetch position history: ${error}`);
		return null;
	}
}

// ============================================================
// Stats Endpoint
// ============================================================

async function fetchProtocolMetrics(): Promise<ProtocolMetricsResponse | null> {
	try {
		const response = await fetch(`${BASE_URL}/stats/protocol_metrics`);
		if (!response.ok) {
			console.error(`Failed to fetch protocol metrics: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as ProtocolMetricsResponse;
	} catch (error) {
		console.error(`Failed to fetch protocol metrics: ${error}`);
		return null;
	}
}

// ============================================================
// Wallet Pool Claims Endpoint
// ============================================================

async function fetchWalletPoolClaims(params: FetchWalletPoolClaimsParams): Promise<WalletTotalClaimsResponse | null> {
	const { wallet, pool_address } = params;
	const url = `${BASE_URL}/wallets/${wallet}/pools/${pool_address}/total_claims`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`Failed to fetch wallet pool claims: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as WalletTotalClaimsResponse;
	} catch (error) {
		console.error(`Failed to fetch wallet pool claims: ${error}`);
		return null;
	}
}

export {
	fetchClosedPortfolio,
	fetchOpenPortfolio,
	fetchPortfolioTotal,
	fetchPositionPnL,
	fetchPositionHistory,
	fetchProtocolMetrics,
	fetchWalletPoolClaims,
};
