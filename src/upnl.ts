import { Connection, PublicKey } from "@solana/web3.js";
import DLMM from "@meteora-ag/dlmm";
import { getAllUserPositions, getPositionSummaries } from "./positions";
import { getInitialDepositsHelius } from "./initialDepositHelius";

interface UpnlResult {
	initialDepositInSol: number;
	currentValueInSol: number;
	unclaimedFeesInSol: number;
	upnl: number;
	upnlWithFees: number;
	upnlPercent: number;
	upnlWithFeesPercent: number;
}

interface GetUpnlParams {
	connection: Connection;
	walletAddress: PublicKey;
	heliusApiKey: string;
	maxTransactions?: number;
}

async function getUpnl(params: GetUpnlParams): Promise<UpnlResult | null> {
	const { connection, walletAddress, heliusApiKey, maxTransactions } = params;

	const positions = await getAllUserPositions({ connection, walletAddress });
	if (!positions) {
		return null;
	}

	const summaries = await getPositionSummaries(positions, connection);
	const deposits = await getInitialDepositsHelius({
		connection,
		walletAddress,
		heliusApiKey,
		maxTransactions,
		positions,
		summaries,
	});

	const currentValueInSol = summaries.reduce((sum, s) => sum + s.depositValueInSol, 0);

	let initialDepositInSol = 0;
	for (const deposit of deposits.values()) {
		initialDepositInSol += deposit.valueInSol;
	}

	const unclaimedFeesInSol = summaries.reduce((sum, s) => sum + s.unclaimedFeeValueInSol, 0);

	const upnl = currentValueInSol - initialDepositInSol;
	const upnlWithFees = currentValueInSol + unclaimedFeesInSol - initialDepositInSol;
	const upnlPercent = initialDepositInSol > 0 ? (upnl / initialDepositInSol) * 100 : 0;
	const upnlWithFeesPercent =
		initialDepositInSol > 0 ? (upnlWithFees / initialDepositInSol) * 100 : 0;

	return {
		initialDepositInSol,
		currentValueInSol,
		unclaimedFeesInSol,
		upnl,
		upnlWithFees,
		upnlPercent,
		upnlWithFeesPercent,
	};
}

interface PositionUpnl {
	pairAddress: string;
	positionAddress: string;
	tokenXMint: string;
	tokenYMint: string;
	initialDepositInSol: number;
	currentValueInSol: number;
	unclaimedFeesInSol: number;
	upnl: number;
	upnlWithFees: number;
	upnlPercent: number;
	upnlWithFeesPercent: number;
}

interface GetUpnlPerPositionParams {
	connection: Connection;
	walletAddress: PublicKey;
	heliusApiKey: string;
	maxTransactions?: number;
}

async function getUpnlPerPosition(
	params: GetUpnlPerPositionParams,
): Promise<PositionUpnl[] | null> {
	const { connection, walletAddress, heliusApiKey, maxTransactions } = params;

	const positions = await getAllUserPositions({ connection, walletAddress });
	if (!positions) {
		return null;
	}

	const summaries = await getPositionSummaries(positions, connection);
	const deposits = await getInitialDepositsHelius({
		connection,
		walletAddress,
		heliusApiKey,
		maxTransactions,
		positions,
		summaries,
	});

	const SOL_MINT = "So11111111111111111111111111111111111111112";
	const results: PositionUpnl[] = [];

	for (const summary of summaries) {
		const isTokenXSol = summary.tokenXMint === SOL_MINT;
		const isTokenYSol = summary.tokenYMint === SOL_MINT;

		if (!isTokenXSol && !isTokenYSol) {
			continue;
		}

		const pairPositions = positions.get(summary.pairAddress);
		if (!pairPositions?.lbPairPositionsData) {
			continue;
		}

		const dlmmPool = await DLMM.create(connection, new PublicKey(summary.pairAddress));
		const activeBin = await dlmmPool.getActiveBin();
		const pricePerLamport = Number(activeBin.pricePerToken);

		for (const lbPosition of pairPositions.lbPairPositionsData) {
			const positionAddress = lbPosition.publicKey.toBase58();
			const deposit = deposits.get(positionAddress);

			const tokenXAmount =
				Number(lbPosition.positionData.totalXAmount) / 10 ** pairPositions.tokenX.mint.decimals;
			const tokenYAmount =
				Number(lbPosition.positionData.totalYAmount) / 10 ** pairPositions.tokenY.mint.decimals;
			const unclaimedFeeX =
				Number(lbPosition.positionData.feeX) / 10 ** pairPositions.tokenX.mint.decimals;
			const unclaimedFeeY =
				Number(lbPosition.positionData.feeY) / 10 ** pairPositions.tokenY.mint.decimals;

			let currentValueInSol = 0;
			let unclaimedFeesInSol = 0;

			if (isTokenXSol) {
				currentValueInSol = tokenXAmount + tokenYAmount * pricePerLamport;
				unclaimedFeesInSol = unclaimedFeeX + unclaimedFeeY * pricePerLamport;
			} else {
				currentValueInSol = tokenYAmount + tokenXAmount * pricePerLamport;
				unclaimedFeesInSol = unclaimedFeeY + unclaimedFeeX * pricePerLamport;
			}

			const initialDepositInSol = deposit?.valueInSol ?? 0;
			const upnl = currentValueInSol - initialDepositInSol;
			const upnlWithFees = currentValueInSol + unclaimedFeesInSol - initialDepositInSol;
			const upnlPercent = initialDepositInSol > 0 ? (upnl / initialDepositInSol) * 100 : 0;
			const upnlWithFeesPercent =
				initialDepositInSol > 0 ? (upnlWithFees / initialDepositInSol) * 100 : 0;

			results.push({
				pairAddress: summary.pairAddress,
				positionAddress,
				tokenXMint: summary.tokenXMint,
				tokenYMint: summary.tokenYMint,
				initialDepositInSol,
				currentValueInSol,
				unclaimedFeesInSol,
				upnl,
				upnlWithFees,
				upnlPercent,
				upnlWithFeesPercent,
			});
		}
	}

	return results;
}

export type { UpnlResult, GetUpnlParams, PositionUpnl, GetUpnlPerPositionParams };
export { getUpnl, getUpnlPerPosition };
