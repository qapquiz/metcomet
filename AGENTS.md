# AGENTS.md - Coding Guidelines for metcomet

This file provides guidelines for AI agents working on the metcomet codebase (Meteora DLMM helper library).

## Build & Development Commands

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Development with watch mode
bun run dev

# Run all tests
bun run test

# Run a single test file
bun test test/index.test.ts

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch

# Lint code
bun run lint

# Format code
bun run format

# Type check without emitting
bun run type-check
```

## Code Style Guidelines

### Formatting
- **Indentation**: Use tabs (configured in `.editorconfig`)
- **Quotes**: Use single quotes for strings
- **Line endings**: LF (Unix-style)
- **Trailing whitespace**: Trim automatically
- **Final newline**: Always include

### TypeScript Configuration
- Target: ESNext with module preservation
- Strict mode enabled
- `verbatimModuleSyntax: true` - use `import type` for type-only imports
- `noUncheckedIndexedAccess: true` - handle potentially undefined array/object access
- `isolatedDeclarations: true` - ensure each file can be type-checked independently

### Naming Conventions
- **Files**: camelCase for source files (e.g., `positions.ts`, `solPrice.ts`)
- **Directories**: camelCase for feature directories (e.g., `api/`)
- **Interfaces**: PascalCase (e.g., `PositionSummary`, `FetchOHLCVParams`)
- **Types**: PascalCase (e.g., `PairAddress`)
- **Functions**: camelCase (e.g., `getAllUserPositions`, `fetchPool`)
- **Variables**: camelCase
- **API functions**: Prefix with `fetch` (e.g., `fetchPools`, `fetchPortfolio`)

### Import Patterns
- Use ES modules with `type: "module"`
- Prefer named exports over default exports
- Use `import type` for type-only imports when using `verbatimModuleSyntax`

Example:
```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import DLMM, {
	type LbPosition,
	type PositionInfo,
} from "@meteora-ag/dlmm";
```

### Function Patterns
- Use async/await for asynchronous operations
- Return typed Promises: `Promise<Type | null>`
- Wrap async operations in try/catch blocks
- Return `null` on errors after logging (consistent pattern in this codebase)

Example:
```typescript
async function fetchData(params: Params): Promise<Result | null> {
	try {
		const data = await someAsyncOperation();
		return data;
	} catch (error) {
		console.error(`Failed to fetch data: ${error}`);
		return null;
	}
}
```

### Error Handling
- Log errors with `console.error()` including context
- Return `null` for failed operations rather than throwing
- Type-safe error handling with null checks

### Interface Definitions
- Define params interfaces for function inputs: `XxxParams`
- Define return interfaces for complex return types
- Use readonly where appropriate
- Document units (e.g., lamports vs SOL, timestamps)

### Exports
- Export types separately from implementations
- Group related exports at file end:

```typescript
export type { Interface1, Interface2, TypeAlias };
export { function1, function2 };
```

## Project Structure

```
src/
├── index.ts              # Main exports (re-exports all modules)
├── positions.ts          # DLMM SDK position management
├── ohlcv.ts             # OHLCV helpers (legacy, uses DLMM API)
├── solPrice.ts          # SOL price utilities
├── upnl.ts              # Unrealized PnL calculations
├── initialDepositHelius.ts  # Helius integration for deposit tracking
└── api/                 # DLMM API wrappers (fetch-based)
    ├── index.ts         # Re-exports all API functions and types
    ├── pools.ts         # Pool API functions
    ├── portfolio.ts      # Portfolio API functions
    └── types.ts         # API response types

test/
├── helpers.ts           # Shared test utilities
├── initialDeposit.test.ts
├── ohlcv.test.ts
├── positions.test.ts
├── solPrice.test.ts
├── upnl.test.ts
├── api-pools.test.ts    # Pool API tests
└── api-portfolio.test.ts # Portfolio API tests
```

## API Module Guidelines

The `src/api/` directory wraps the [Meteora DLMM API](https://dlmm.datapi.meteora.ag).

### API Base URL
```
https://dlmm.datapi.meteora.ag
```

### Naming Conventions for API Functions
- Functions use `fetch` prefix (e.g., `fetchPools`, `fetchPortfolio`)
- Avoid naming conflicts with SDK functions (e.g., `fetchPoolOHLCV` vs `fetchOHLCV`)
- Helper functions use descriptive names (e.g., `getLatestOHLCVCandle`)

### API Types
- All API response types are defined in `src/api/types.ts`
- Types are exported from `src/api/index.ts`
- Match actual API response structure (verify with live API if needed)

### Rate Limiting
- Public API allows 30 requests/second per IP
- For mobile apps, each device has its own IP (no backend needed)
- For web apps served from a single server, all users share the same IP

## Git Hooks

Pre-commit hooks run automatically:
- `bun run lint` - Code linting
- `bun run type-check` - TypeScript validation

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style/formatting
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test changes
- `chore:` Maintenance tasks

## Dependencies

Key dependencies to be aware of:
- `@meteora-ag/dlmm` - DLMM SDK
- `@solana/web3.js` - Solana web3
- `@coral-xyz/anchor` - Anchor framework
- Uses Bun runtime (not Node.js)

## Common Constants

- SOL mint address: `"So11111111111111111111111111111111111111112"`
- DLMM API base URL: `https://dlmm.datapi.meteora.ag`
- Supports both PublicKey objects and base58 strings for addresses
