// types/flutterwave.d.ts
// Create this file in your project's types directory

declare global {
   interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  country?: string;
  payment_options: string;
  customer: FlutterwaveCustomer;
  customizations: FlutterwaveCustomizations;
  callback: (data: FlutterwaveCallbackData) => void;
  onclose: () => void;
  meta?: Record<string, any>;
  payment_plan?: string;
  subaccounts?: FlutterwaveSubaccount[];
}

export interface FlutterwaveCustomer {
  email: string;
  phone_number: string;
  name: string;
  id?: string;
}

export interface FlutterwaveCustomizations {
  title: string;
  description: string;
  logo?: string;
}

export interface FlutterwaveCallbackData {
  status: string;
  transaction_id: string;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  customer: {
    id: number;
    email: string;
    phone_number: string;
    name: string;
    created_at: string;
  };
  card?: {
    first_6digits: string;
    last_4digits: string;
    issuer: string;
    country: string;
    type: string;
    expiry: string;
  };
  created_at: string;
  app_fee: number;
  merchant_fee: number;
  processor_response: string;
  auth_model: string;
  ip: string;
  narration: string;
  charged_amount: number;
  payment_type: string;
}

export interface FlutterwaveSubaccount {
  id: string;
  transaction_split_ratio?: number;
  transaction_charge_type?: string;
  transaction_charge?: number;
}

export interface FlutterwaveVerificationResponse {
  status: string;
  message: string;
  data: FlutterwaveCallbackData;
}

// For your order payload type
export interface OrderPayload {
  trackingID: string;
  customerID: string | null;
  merchantID: string | null;
  giftID: number;
  paymentMethod: string;
  amount: number;
  networkFee: number;
  recipientName: string;
  recipientStreet: string;
  recipientCity: string;
  recipientState: string;
  recipientCountry: string;
  giftMessage: string;
  quantity: number;
  gift: string;
  status: string;
  recipientPhone: string;
  senderWallet: string;
}

export {};