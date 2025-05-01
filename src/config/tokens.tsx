export const TOKEN_ADDRESSES = {
  PEPE: "B5WTLaRwaUQpKk7ir1wniNB6m5o8GgMrimhKMYan2R6B",
  SOL: "So11111111111111111111111111111111111111112",
  CWIF: "7atgF8KQo4wJrD5ATGX7t1V2zVvykPJbFfNeVf1icFv1",
  MEW: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
  WEN: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  KIN: "kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
} as const;

export type TokenAddress =
  (typeof TOKEN_ADDRESSES)[keyof typeof TOKEN_ADDRESSES];

export interface TokenInfo {
  symbol: keyof typeof TOKEN_ADDRESSES;
  address: TokenAddress;
  decimals: number;
  label: string;
}

export const TOKEN_LIST: TokenInfo[] = [
  { symbol: "USDC", address: TOKEN_ADDRESSES.USDC, decimals: 6, label: "USDC" },
  { symbol: "USDT", address: TOKEN_ADDRESSES.USDT, decimals: 6, label: "USDT" },
  { symbol: "SOL", address: TOKEN_ADDRESSES.SOL, decimals: 9, label: "SOL" },
];
