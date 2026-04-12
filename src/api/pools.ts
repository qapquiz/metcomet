import type {
	PoolsResponse,
	PoolResponse,
	FetchPoolsParams,
	OHLCVResponse,
	FetchOHLCVParams,
	OHLCVCandle,
	VolumeHistoryResponse,
	FetchVolumeHistoryParams,
	GroupsResponse,
	FetchGroupsParams,
} from "./types";

const BASE_URL = "https://dlmm.datapi.meteora.ag";

// ============================================================
// Pool Endpoints
// ============================================================

async function fetchPools(params?: FetchPoolsParams): Promise<PoolsResponse | null> {
	const url = new URL(`${BASE_URL}/pools`);

	if (params?.page) url.searchParams.set("page", String(params.page));
	if (params?.page_size) url.searchParams.set("page_size", String(params.page_size));
	if (params?.query) url.searchParams.set("query", params.query);
	if (params?.sort_by) url.searchParams.set("sort_by", params.sort_by);
	if (params?.filter_by) url.searchParams.set("filter_by", params.filter_by);

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch pools: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as PoolsResponse;
	} catch (error) {
		console.error(`Failed to fetch pools: ${error}`);
		return null;
	}
}

async function fetchPool(address: string): Promise<PoolResponse | null> {
	try {
		const response = await fetch(`${BASE_URL}/pools/${address}`);
		if (!response.ok) {
			console.error(`Failed to fetch pool ${address}: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as PoolResponse;
	} catch (error) {
		console.error(`Failed to fetch pool ${address}: ${error}`);
		return null;
	}
}

// ============================================================
// OHLCV Endpoint
// ============================================================

async function fetchPoolOHLCV(params: FetchOHLCVParams): Promise<OHLCVResponse | null> {
	const { poolAddress, timeframe = "1h", start_time, end_time } = params;
	const url = new URL(`${BASE_URL}/pools/${poolAddress}/ohlcv`);

	url.searchParams.set("timeframe", timeframe);
	if (start_time) url.searchParams.set("start_time", String(start_time));
	if (end_time) url.searchParams.set("end_time", String(end_time));

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch OHLCV: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as OHLCVResponse;
	} catch (error) {
		console.error(`Failed to fetch OHLCV: ${error}`);
		return null;
	}
}

function getLatestOHLCVCandle(ohlcvData: OHLCVResponse): OHLCVCandle | null {
	if (ohlcvData.data && ohlcvData.data.length > 0) {
		return ohlcvData.data[ohlcvData.data.length - 1] ?? null;
	}
	return null;
}

// ============================================================
// Volume History Endpoint
// ============================================================

async function fetchVolumeHistory(params: FetchVolumeHistoryParams): Promise<VolumeHistoryResponse | null> {
	const { poolAddress, timeframe = "24h", start_time, end_time } = params;
	const url = new URL(`${BASE_URL}/pools/${poolAddress}/volume/history`);

	url.searchParams.set("timeframe", timeframe);
	if (start_time) url.searchParams.set("start_time", String(start_time));
	if (end_time) url.searchParams.set("end_time", String(end_time));

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch volume history: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as VolumeHistoryResponse;
	} catch (error) {
		console.error(`Failed to fetch volume history: ${error}`);
		return null;
	}
}

// ============================================================
// Pool Groups Endpoints
// ============================================================

async function fetchGroups(params?: FetchGroupsParams): Promise<GroupsResponse | null> {
	const url = new URL(`${BASE_URL}/pools/groups`);

	if (params?.page) url.searchParams.set("page", String(params.page));
	if (params?.page_size) url.searchParams.set("page_size", String(params.page_size));
	if (params?.query) url.searchParams.set("query", params.query);
	if (params?.sort_by) url.searchParams.set("sort_by", params.sort_by);
	if (params?.filter_by) url.searchParams.set("filter_by", params.filter_by);
	if (params?.volume_tw) url.searchParams.set("volume_tw", params.volume_tw);
	if (params?.fee_tvl_ratio_tw) url.searchParams.set("fee_tvl_ratio_tw", params.fee_tvl_ratio_tw);

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			console.error(`Failed to fetch groups: ${response.status} ${response.statusText}`);
			return null;
		}
		return (await response.json()) as GroupsResponse;
	} catch (error) {
		console.error(`Failed to fetch groups: ${error}`);
		return null;
	}
}

// Note: OpenAPI spec says GroupResponse but actual schema ref is PaginationResponse_PoolResponse
async function fetchGroup(lexicalOrderMints: string): Promise<unknown | null> {
	try {
		const response = await fetch(`${BASE_URL}/pools/groups/${lexicalOrderMints}`);
		if (!response.ok) {
			console.error(`Failed to fetch group ${lexicalOrderMints}: ${response.status} ${response.statusText}`);
			return null;
		}
		return await response.json();
	} catch (error) {
		console.error(`Failed to fetch group ${lexicalOrderMints}: ${error}`);
		return null;
	}
}

export {
	fetchPools,
	fetchPool,
	fetchPoolOHLCV,
	getLatestOHLCVCandle,
	fetchVolumeHistory,
	fetchGroups,
	fetchGroup,
};
