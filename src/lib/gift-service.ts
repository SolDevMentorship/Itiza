// This is a mock implementation of the gift service
// In a real application, this would interact with your backend API

interface CreateGiftParams {
  senderAddress: string
  phoneNumber: string
  amount: number
  signature: string
}

interface RedeemGiftParams {
  code: string
  recipientAddress: string
}

interface GiftResult {
  code: string
  amount: number
  phoneNumber: string
  status: "pending" | "redeemed"
}

// Mock database of gifts
const giftDatabase: Record<string, GiftResult> = {}

export async function createGift(params: CreateGiftParams): Promise<GiftResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate a random 6-character code
  const code = Array(6)
    .fill(0)
    .map(() =>
      Math.floor(Math.random() * 36)
        .toString(36)
        .toUpperCase(),
    )
    .join("")

  // Store the gift in our mock database
  const gift: GiftResult = {
    code,
    amount: params.amount,
    phoneNumber: params.phoneNumber,
    status: "pending",
  }

  giftDatabase[code] = gift

  return gift
}

export async function redeemGift(params: RedeemGiftParams): Promise<GiftResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const gift = giftDatabase[params.code]

  if (!gift || gift.status === "redeemed") {
    throw new Error("Invalid or already redeemed gift code")
  }

  // Mark as redeemed
  gift.status = "redeemed"

  // In a real application, this is where you would:
  // 1. Transfer funds from escrow to the airtime provider
  // 2. Call the airtime provider's API to credit the phone number

  return gift
}

export async function getPendingGifts(address: string): Promise<GiftResult[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // This would normally filter by recipient, but for demo purposes
  // we'll just return any pending gifts
  return Object.values(giftDatabase).filter((gift) => gift.status === "pending")
}
