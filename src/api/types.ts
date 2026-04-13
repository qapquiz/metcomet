// ============================================================
// Pool API Types
// ============================================================

export interface TokenMetrics {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	is_verified: boolean;
	holders: number;
	freeze_authority_disabled: boolean;
	total_supply: number;
	price: number;
	market_cap: number;
}

export interface Token {
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	icon: string;
}

export interface PoolConfig {
	bin_step: number;
	base_fee_pct: number;
	max_fee_pct: number;
	protocol_fee_pct: number;
}

export interface TimeWindowData {
	"30m": number;
	"1h": number;
	"2h": number;
	"4h": number;
	"12h": number;
	"24h": number;
}

export interface CumulativeMetrics {
	total_volume: number;
	total_fees: number;
	total_liquidation_volume: number;
	total_liquidation_fee: number;
}

export interface PoolResponse {
	address: string;
	name: string;
	token_x: TokenMetrics;
	token_y: TokenMetrics;
	reserve_x: string;
	reserve_y: string;
	token_x_amount: number;
	token_y_amount: number;
	created_at: number;
	reward_mint_x: string;
	reward_mint_y: string;
	pool_config: PoolConfig;
	dynamic_fee_pct: number;
	tvl: number;
	current_price: number;
	apr: number;
	apy: number;
	has_farm: boolean;
	farm_apr: number;
	farm_apy: number;
	volume: TimeWindowData;
	fees: TimeWindowData;
	protocol_fees: TimeWindowData;
	fee_tvl_ratio: TimeWindowData;
	cumulative_metrics: CumulativeMetrics;
	is_blacklisted: boolean;
	tags: string[];
	launchpad: string | null;
}

export interface PoolsResponse {
	total: number;
	pages: number;
	current_page: number;
	page_size: number;
	data: PoolResponse[];
}

export interface FetchPoolsParams {
	page?: number;
	page_size?: number;
	query?: string;
	sort_by?: string;
	filter_by?: string;
}

// ============================================================
// OHLCV & Volume Types
// ============================================================

export interface OHLCVCandle {
	timestamp: number;
	timestamp_str: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface OHLCVResponse {
	start_time: number;
	end_time: number;
	timeframe: string | null;
	data: OHLCVCandle[];
}

export interface FetchOHLCVParams {
	poolAddress: string;
	timeframe?: string;
	start_time?: number;
	end_time?: number;
}

export interface VolumeHistoryItem {
	timestamp: number;
	timestamp_str: string;
	volume: number;
	fees: number;
	protocol_fees: number;
}

export interface VolumeHistoryResponse {
	start_time: number;
	end_time: number;
	timeframe: string | null;
	data: VolumeHistoryItem[];
}

export interface FetchVolumeHistoryParams {
	poolAddress: string;
	timeframe?: string;
	start_time?: number;
	end_time?: number;
}

// ============================================================
// Portfolio API Types
// ============================================================

export interface TokenAmount {
	amount: string;
	amountSol: string | null;
	usd: string;
}

export interface TotalUsd {
	usd: string;
	sol: string | null;
}

export interface TokenPairWithTotal {
	tokenX: TokenAmount;
	tokenY: TokenAmount;
	total: TotalUsd;
}

export interface PoolPortfolioItem {
	poolAddress: string;
	binStep: string;
	baseFee: string;
	tokenXMint: string;
	tokenYMint: string;
	tokenXIcon: string;
	tokenYIcon: string;
	tokenX: string;
	tokenY: string;
	rewardX: string;
	rewardY: string;
	totalDeposit: string;
	totalDepositSol: string;
	totalWithdrawal: string;
	totalWithdrawalSol: string;
	totalFee: string;
	totalFeeSol: string;
	pnlUsd: string;
	pnlSol: string;
	pnlPctChange: string;
	pnlSolPctChange: string;
	totalDepositTokenX: string;
	totalDepositTokenXUsd: string;
	totalDepositTokenXSol: string;
	totalWithdrawalTokenX: string;
	totalWithdrawalTokenXUsd: string;
	totalWithdrawalTokenXSol: string;
	totalFeeTokenX: string;
	totalFeeTokenXUsd: string;
	totalFeeTokenXSol: string;
	totalDepositTokenY: string;
	totalDepositTokenYUsd: string;
	totalDepositTokenYSol: string;
	totalWithdrawalTokenY: string;
	totalWithdrawalTokenYUsd: string;
	totalWithdrawalTokenYSol: string;
	totalFeeTokenY: string;
	totalFeeTokenYUsd: string;
	totalFeeTokenYSol: string;
	lastClosedAt: number | null;
}

export interface ClosedPortfolioResponse {
	pools: PoolPortfolioItem[];
	totalCount: number;
	page: number;
	pageSize: number;
	hasNext: boolean;
}

export interface FetchClosedPortfolioParams {
	user: string;
	page?: number;
	page_size?: number;
	days_back?: number;
}

// ============================================================
// Open Portfolio Types
// ============================================================

export interface TotalMetrics {
	balances: string;
	balancesSol: string | null;
	unclaimedFees: string;
	unclaimedFeesSol: string | null;
	pnl: string;
	pnlPctChange: string;
	pnlSol: string | null;
	pnlSolPctChange: string | null;
}

export interface PoolOpenPortfolioItem {
	poolAddress: string;
	binStep: number;
	baseFee: number;
	tokenXMint: string;
	tokenYMint: string;
	tokenXIcon: string;
	tokenYIcon: string;
	tokenX: string;
	tokenY: string;
	rewardX: string;
	rewardY: string;
	balances: string;
	balancesSol: string | null;
	unclaimedFees: string;
	unclaimedFeesSol: string | null;
	feePerTvl24h: string;
	pnl: string;
	pnlPctChange: string;
	pnlSol: string | null;
	pnlSolPctChange: string | null;
	totalDeposit: string;
	totalDepositSol: string | null;
	openPositionCount: number;
	listPositions: string[];
	positionsOutOfRange: string[];
	outOfRange: boolean | null;
	poolPrice: number | null;
	poolStateUpdatedAtSlot: number | null;
	poolStateUpdatedAtBlockTime: number | null;
}

export interface OpenPortfolioResponse {
	pools: PoolOpenPortfolioItem[];
	total: TotalMetrics;
	solPrice: string | null;
	totalCount: number;
	page: number;
	pageSize: number;
	hasNext: boolean;
}

export interface FetchOpenPortfolioParams {
	user: string;
	page?: number;
	page_size?: number;
	sort_by?: "current_balances" | "unclaimed_fee" | "fee_per_tvl24h";
	sort_direction?: "asc" | "desc";
}

// ============================================================
// Portfolio Total Types
// ============================================================

export interface PortfolioTotalResponse {
	totalPnlUsd: string;
	totalPnlSol: string;
	totalPnlPctChange: string;
	totalPnlSolPctChange: string;
}

// ============================================================
// Position PnL Types
// ============================================================

export interface UnrealizedPnL {
	balances: number;
	balancesSol: string | null;
	balanceTokenX: TokenAmount;
	balanceTokenY: TokenAmount;
	unclaimedFeeTokenX: TokenAmount;
	unclaimedFeeTokenY: TokenAmount;
	unclaimedRewardTokenX: TokenAmount;
	unclaimedRewardTokenY: TokenAmount;
}

export interface PositionPnLData {
	positionAddress: string;
	minPrice: string;
	maxPrice: string;
	lowerBinId: number;
	upperBinId: number;
	feePerTvl24h: string;
	isClosed: boolean;
	pnlUsd: string;
	pnlPctChange: string;
	pnlSol: number | null;
	pnlSolPctChange: number | null;
	allTimeDeposits: TokenPairWithTotal;
	allTimeWithdrawals: TokenPairWithTotal;
	allTimeFees: TokenPairWithTotal;
	unrealizedPnl: UnrealizedPnL | null;
	isOutOfRange: boolean | null;
	poolActiveBinId: number | null;
	poolActivePrice: string | null;
	createdAt: number | null;
	closedAt: number | null;
}

export interface PositionPnLResponse {
	positions: PositionPnLData[];
	tokenX: string | null;
	tokenY: string | null;
	tokenXPrice: string;
	tokenYPrice: string;
	rewardTokenX: string | null;
	rewardTokenY: string | null;
	rewardTokenXPrice: string;
	rewardTokenYPrice: string;
	solPrice: string | null;
	totalCount: number;
	page: number;
	pageSize: number;
	hasNext: boolean;
}

export interface FetchPositionPnLParams {
	poolAddress: string;
	user: string;
	status?: "open" | "closed" | "all";
	page?: number;
	page_size?: number;
}

// ============================================================
// Position Historical Events Types
// ============================================================

export interface PositionEvent {
	signature: string;
	ixIndex: number;
	eventType: string;
	positionAddress: string;
	blockTime: number;
	slot: number;
	poolAddress: string;
	userAddress: string;
	tokenX: string;
	tokenY: string;
	amountX: string;
	amountY: string;
	amountXUsd: string;
	amountYUsd: string;
	totalUsd: string;
	createdAt: string;
}

export interface PositionHistoryResponse {
	events: PositionEvent[];
}

export interface FetchPositionHistoryParams {
	positionAddress: string;
	event_type?: "add" | "remove" | "claim_fee" | "claim_reward";
	order_direction?: "asc" | "desc";
}

// ============================================================
// Protocol Metrics Types
// ============================================================

export interface ProtocolMetricsResponse {
	total_tvl: number;
	volume_24h: number;
	fee_24h: number;
	total_volume: number;
	total_fees: number;
	total_pools: number;
}

// ============================================================
// Wallet Pool Claims Types
// ============================================================

export interface WalletTotalClaimsResponse {
	pool_address: string;
	user_address: string;
	total_fee_x: string;
	total_fee_y: string;
	total_fee_x_usd: string;
	total_fee_y_usd: string;
	fee_claim_count: number;
	last_fee_claim_time: string | null;
	total_reward_x: string;
	total_reward_y: string;
	total_reward_x_usd: string;
	total_reward_y_usd: string;
	reward_claim_count: number;
	last_reward_claim_time: string | null;
	total_claims_usd: string;
}

export interface FetchWalletPoolClaimsParams {
	wallet: string;
	pool_address: string;
}

// ============================================================
// All Open Positions with PnL Types
// ============================================================

export interface PositionWithPoolInfo {
	position: PositionPnLData;
	poolAddress: string;
	tokenX: string;
	tokenY: string;
	tokenXSymbol: string;
	tokenYSymbol: string;
	tokenXIcon: string;
	tokenYIcon: string;
	binStep: number;
}

export interface AllOpenPositionsResponse {
	positions: PositionWithPoolInfo[];
	totalCount: number;
	solPrice: string | null;
}

export interface FetchAllOpenPositionsParams {
	user: string;
	page_size?: number;
}

// ============================================================
// Pool Groups Types
// ============================================================

export interface GroupResponse {
	lexical_order_mints: string;
	group_name: string;
	token_x: string;
	token_y: string;
	pool_count: number;
	total_tvl: number;
	total_volume: number;
	max_fee_tvl_ratio: number;
	has_farm: boolean;
}

export interface GroupsResponse {
	total: number;
	pages: number;
	current_page: number;
	page_size: number;
	data: GroupResponse[];
}

export interface FetchGroupsParams {
	page?: number;
	page_size?: number;
	query?: string;
	sort_by?: string;
	filter_by?: string;
	volume_tw?: string;
	fee_tvl_ratio_tw?: string;
}
