import { Connection, PublicKey } from "@solana/web3.js";
import DLMM, {
	type LbPosition,
	type PositionInfo,
	type PositionVersion,
	type TokenReserve,
} from "@meteora-ag/dlmm";
import {
	fetchPositionPnL,
	type PositionPnLData,
	type PositionPnLResponse,
} from "./api";

export interface EnrichedPosition {
	poolAddress: string;
	tokenX: TokenReserve;
	tokenY: TokenReserve;
	positions: EnrichedLbPosition[];
}

export interface EnrichedLbPosition {
	publicKey: PublicKey;
	positionData: LbPosition["positionData"];
	version: PositionVersion;
	pnl: PositionPnLData | null;
}

export interface GetAllUserPositionsWithPnLOptions {
	status?: "open" | "closed" | "all";
	pageSize?: number;
}

/**
 * Merge SDK positions with API PnL results.
 * 
 * @param positions - Map of poolAddress -> PositionInfo from SDK
 * @param pnlResults - Array of PositionPnLResponse (one per pool, same order as poolAddresses)
 * @param poolAddresses - Array of pool addresses (keys from positions map)
 */
export function mergePositionsWithPnL(
	positions: Map<string, PositionInfo>,
	pnlResults: (PositionPnLResponse | null)[],
	poolAddresses: string[],
): EnrichedPosition[] {
	const enriched: EnrichedPosition[] = [];

	for (const [poolAddress, positionInfo] of positions) {
		const pnlResponse = pnlResults[poolAddresses.indexOf(poolAddress)];
		if (!pnlResponse) continue;

		// Build O(1) lookup map
		const pnlMap = new Map(
			pnlResponse.positions.map((p) => [p.positionAddress, p]),
		);

		// Attach PnL to each position
		const enrichedPositions: EnrichedLbPosition[] =
			positionInfo.lbPairPositionsData.map((lbPos) => {
				const addr = lbPos.publicKey.toBase58();
				return {
					publicKey: lbPos.publicKey,
					positionData: lbPos.positionData,
					version: lbPos.version,
					pnl: pnlMap.get(addr) ?? null,
				};
			});

		enriched.push({
			poolAddress,
			tokenX: positionInfo.tokenX,
			tokenY: positionInfo.tokenY,
			positions: enrichedPositions,
		});
	}

	return enriched;
}

/**
 * Convenience wrapper: Get positions from SDK + fetch PnL from API + merge.
 * 
 * For more control, use getAllUserPositions (SDK) + fetchPositionPnL (API) + mergePositionsWithPnL separately.
 */
export async function getAllUserPositionsWithPnL(
	connection: Connection,
	walletAddress: PublicKey,
	options?: GetAllUserPositionsWithPnLOptions,
): Promise<EnrichedPosition[] | null> {
	const { status = "open", pageSize = 50 } = options ?? {};
	const wallet = walletAddress.toBase58();

	// STEP 1: Get positions from SDK
	let sdkPositions: Map<string, PositionInfo>;
	try {
		sdkPositions = await DLMM.getAllLbPairPositionsByUser(
			connection,
			walletAddress,
		);
		if (!sdkPositions || sdkPositions.size === 0) {
			return null;
		}
	} catch (error) {
		console.error(`Failed to get positions: ${error}`);
		return null;
	}

	// STEP 2: Extract pool addresses
	const poolAddresses = [...sdkPositions.keys()];

	// STEP 3: Fetch PnL for each pool (API) in parallel
	const pnlResults = await Promise.all(
		poolAddresses.map((addr) =>
			fetchPositionPnL({
				poolAddress: addr,
				user: wallet,
				status,
				page_size: pageSize,
			}).catch((err) => {
				console.error(`Failed to fetch PnL for ${addr}: ${err}`);
				return null;
			}),
		),
	);

	// STEP 4: Merge SDK + API data
	const enriched = mergePositionsWithPnL(sdkPositions, pnlResults, poolAddresses);

	return enriched.length > 0 ? enriched : null;
}
