import { Connection, PublicKey } from "@solana/web3.js";
import DLMM from "@meteora-ag/dlmm";
import { fetchPositionPnL } from "../src/api";
import {
	getAllUserPositionsWithPnL,
	mergePositionsWithPnL,
} from "../src/enrichedPositions";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const walletAddress = new PublicKey("87bdcSg4zvjExbvsUSbGifYUp75JdLhLafjgwvCjzjkA");

async function main() {
	console.log(`Fetching positions for: ${walletAddress.toBase58()}\n`);

	const start = Date.now();

	// ============================================================
	// APPROACH 1: Convenience wrapper (all-in-one)
	// ============================================================
	console.log("=== Approach 1: getAllUserPositionsWithPnL ===\n");

	const enriched = await getAllUserPositionsWithPnL(connection, walletAddress, {
		status: "open",
		pageSize: 50,
	});

	if (!enriched) {
		console.log("No positions found");
		return;
	}

	printPositions(enriched);

	console.log(`\nDuration: ${Date.now() - start}ms\n`);
	console.log("=".repeat(80));

	// ============================================================
	// APPROACH 2: Separate calls + manual merge
	// ============================================================
	console.log("\n=== Approach 2: Separate calls + mergePositionsWithPnL ===\n");

	const step1 = Date.now();
	const sdkPositions = await DLMM.getAllLbPairPositionsByUser(
		connection,
		walletAddress,
	);
	const poolAddresses = [...sdkPositions.keys()];

	const pnlResults = await Promise.all(
		poolAddresses.map((addr) =>
			fetchPositionPnL({
				poolAddress: addr,
				user: walletAddress.toBase58(),
				status: "open",
				page_size: 50,
			}),
		),
	);

	const merged = mergePositionsWithPnL(sdkPositions, pnlResults, poolAddresses);
	console.log(`SDK + API merge duration: ${Date.now() - step1}ms\n`);

	printPositions(merged);
}

function printPositions(enriched: NonNullable<Awaited<ReturnType<typeof getAllUserPositionsWithPnL>>>) {
	console.log(`Found ${enriched.length} pools with positions\n`);

	for (const pool of enriched) {
		console.log(`📦 Pool: ${pool.poolAddress}`);
		console.log(`   Token X: ${pool.tokenX.mint.address.toBase58()}`);
		console.log(`   Token Y: ${pool.tokenY.mint.address.toBase58()}`);
		console.log(`   Positions: ${pool.positions.length}`);

		for (const pos of pool.positions) {
			console.log(`\n   ├─ Position: ${pos.publicKey.toBase58()}`);
			if (pos.pnl) {
				console.log(`   │  ├─ PnL USD: $${pos.pnl.pnlUsd}`);
				console.log(`   │  ├─ PnL USD %: ${pos.pnl.pnlPctChange}%`);
				console.log(`   │  ├─ PnL SOL: ${pos.pnl.pnlSol ?? "N/A"}`);
				console.log(`   │  ├─ PnL SOL %: ${pos.pnl.pnlSolPctChange}%`);
				console.log(`   │  ├─ In Range: ${!pos.pnl.isOutOfRange}`);
				console.log(`   │  ├─ Is Closed: ${pos.pnl.isClosed}`);
				console.log(`   │  ├─ Lower Bin: ${pos.pnl.lowerBinId}`);
				console.log(`   │  ├─ Upper Bin: ${pos.pnl.upperBinId}`);
				console.log(
					`   │  ├─ Total Deposit X: ${pos.pnl.allTimeDeposits.tokenX.amount} ($${pos.pnl.allTimeDeposits.tokenX.usd})`,
				);
				console.log(
					`   │  ├─ Total Deposit Y: ${pos.pnl.allTimeDeposits.tokenY.amount} ($${pos.pnl.allTimeDeposits.tokenY.usd})`,
				);
				console.log(
					`   │  ├─ Total Deposit USD: $${pos.pnl.allTimeDeposits.total.usd}`,
				);
				if (pos.pnl.unrealizedPnl) {
					const unclaimedX = parseFloat(pos.pnl.unrealizedPnl.unclaimedFeeTokenX.amount);
					const unclaimedY = parseFloat(pos.pnl.unrealizedPnl.unclaimedFeeTokenY.amount);
					const unclaimedXUsd = parseFloat(pos.pnl.unrealizedPnl.unclaimedFeeTokenX.usd);
					const unclaimedYUsd = parseFloat(pos.pnl.unrealizedPnl.unclaimedFeeTokenY.usd);
					const unclaimedXSol = parseFloat(pos.pnl.unrealizedPnl.unclaimedFeeTokenX.amountSol ?? "0");
					const unclaimedYSol = parseFloat(pos.pnl.unrealizedPnl.unclaimedFeeTokenY.amountSol ?? "0");
					const unclaimedUsd = unclaimedXUsd + unclaimedYUsd;
					const unclaimedSol = unclaimedXSol + unclaimedYSol;
					const claimedUsd = parseFloat(pos.pnl.allTimeFees.total.usd);
					const totalFeesUsd = claimedUsd + unclaimedUsd;

					console.log(`   │  ├─ Unclaimed Fee X: ${unclaimedX} ($${unclaimedXUsd.toFixed(2)}, ${unclaimedXSol} SOL)`);
					console.log(`   │  ├─ Unclaimed Fee Y: ${unclaimedY} ($${unclaimedYUsd.toFixed(2)}, ${unclaimedYSol} SOL)`);
					console.log(`   │  ├─ Unclaimed Fee USD: $${unclaimedUsd.toFixed(2)}`);
					console.log(`   │  ├─ Unclaimed Fee SOL: ${unclaimedSol.toFixed(6)}`);
					console.log(`   │  ├─ Claimed Fee USD: $${claimedUsd.toFixed(2)}`);
					console.log(`   │  └─ Total Fees USD: $${totalFeesUsd.toFixed(2)}`);
				}
			} else {
				console.log(`   │  └─ PnL: Not available`);
			}
		}
	}
}

main().catch(console.error);
