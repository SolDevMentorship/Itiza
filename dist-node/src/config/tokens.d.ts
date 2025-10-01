export declare const TOKEN_ADDRESSES: {
    readonly PEPE: "B5WTLaRwaUQpKk7ir1wniNB6m5o8GgMrimhKMYan2R6B";
    readonly SOL: "So11111111111111111111111111111111111111112";
    readonly CWIF: "7atgF8KQo4wJrD5ATGX7t1V2zVvykPJbFfNeVf1icFv1";
    readonly MEW: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5";
    readonly WEN: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk";
    readonly JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";
    readonly KIN: "kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6";
    readonly USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    readonly USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
};
export type TokenAddress = (typeof TOKEN_ADDRESSES)[keyof typeof TOKEN_ADDRESSES];
export interface TokenInfo {
    symbol: keyof typeof TOKEN_ADDRESSES;
    address: TokenAddress;
    decimals: number;
    label: string;
}
export declare const TOKEN_LIST: TokenInfo[];
