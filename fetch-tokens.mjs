// fetch-tokens.mjs
import { TokenListProvider } from '@solana/spl-token-registry';
import fs from 'fs';
import path from 'path';

const CHAIN_ID_SOLANA = 101;

async function fetchAndSaveTokens() {
    try {
        const provider = new TokenListProvider();
        const tokenListContainer = await provider.resolve();
        const tokens = tokenListContainer.filterByChainId(CHAIN_ID_SOLANA).getList();

        const formattedTokens = tokens
            .map(({ address, symbol }) => ({
                mint: address,
                symbol,
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol));

        const outputPath = path.resolve('./src/utils/tokens.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(formattedTokens, null, 2));

        console.log(`Successfully saved ${formattedTokens.length} tokens to ${outputPath}`);
    } catch (error) {
        console.error('Error fetching tokens:', error);
    }
}

fetchAndSaveTokens();