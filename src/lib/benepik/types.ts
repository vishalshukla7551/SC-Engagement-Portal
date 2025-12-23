export interface RewardRecipient {
  sno: string;
  userName: string;
  countryCode: string;
  mobileNumber: string;
  rewardAmount: string;
  entityId: string;
  transactionId: string;
}

export interface RewardPayload {
  source: string;
  isSms: string;
  isWhatsApp: string;
  isEmail: string;
  data: RewardRecipient[];
}

export interface BenepikResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
