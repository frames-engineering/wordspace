# wallet_check

kind: let

source:
```prose
let wallet_check = session: data-fetcher
  prompt: "Validate wallet connection"
```

---

## Wallet Configuration Status

**Status**: CONNECTED AND CONFIGURED

### Configuration Details
- **Username**: microchipgnu
- **Display Name**: microchipgnu
- **Email**: REDACTED
- **Config File**: ~/.agentwallet/config.json
- **API Token**: REDACTED
- **Base URL**: https://agentwallet.mcpay.tech

### Wallet Addresses
- **EVM Address**: 0xBd9EB8899d7207bEB35A140010E154438a25E55f
- **Solana Address**: 84XvzfPfrZBhy7Rem49aeeWXjTaNU6ooNhWvzJ3ywhr5

### USDC Balances

#### Mainnet Balances
- **Base USDC**: 0.319 USDC (319000 raw, 6 decimals)
- **Solana USDC**: 0.226 USDC (226000 raw, 6 decimals)
- **Ethereum USDC**: 0 USDC
- **Polygon USDC**: 0 USDC
- **Arbitrum USDC**: 0 USDC
- **Optimism USDC**: 0 USDC

**Total Mainnet USDC**: 0.545 USDC

#### Devnet Balances
- **Solana Devnet USDC**: 48.5734 USDC
- **Solana Devnet SOL**: 1.3 SOL

### Summary
The AgentWallet is properly configured and connected. The wallet has sufficient USDC balance (0.545 USDC across Base and Solana mainnet) to make x402/fetch API calls to the Twitter Registry API. The configuration file contains all required fields (username, apiToken) and the API connection is verified.

The wallet can proceed with making Twitter API calls through the x402/fetch proxy at:
```
https://frames.ag/api/wallets/microchipgnu/actions/x402/fetch
```
