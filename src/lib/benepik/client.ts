import crypto from "crypto";
import axios from "axios";
import {
  createBenepikJWT,
  generateChecksum,
  generateSignature
} from "./security";
import { RewardPayload, BenepikResponse } from "./types";

export class BenepikClient {
  private apiUrl: string;

  constructor() {
    const url = process.env.BENEPIK_API_URL;
    if (!url) {
      throw new Error("BENEPIK_API_URL is not configured");
    }
    this.apiUrl = url;
  }

  async sendReward(rewardPayload: RewardPayload): Promise<BenepikResponse> {
    try {
      /* Generate security values */
      const requestId = crypto.randomUUID();
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = crypto.randomBytes(16).toString("hex");
      const jwtToken = createBenepikJWT();
      const checksum = generateChecksum(rewardPayload);

      const signature = generateSignature({
        requestId,
        timestamp,
        nonce,
        checksum
      });

      /* Make API request */
      const response = await axios.post(
        this.apiUrl,
        { checksum },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            REQUESTID: requestId,
            "X-TIMESTAMP": timestamp.toString(),
            "X-NONCE": nonce,
            "X-SIGNATURE": signature,
            "Content-Type": "application/json"
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error("Benepik API error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Reward API failed"
      };
    }
  }

  /**
   * Helper method to create a reward payload for a single user
   */
  createSingleRewardPayload(
    userName: string,
    mobileNumber: string,
    rewardAmount: number,
    options?: {
      countryCode?: string;
      entityId?: string;
      sendSms?: boolean;
      sendWhatsApp?: boolean;
      sendEmail?: boolean;
    }
  ): RewardPayload {
    return {
      source: "0",
      isSms: options?.sendSms !== false ? "1" : "0",
      isWhatsApp: options?.sendWhatsApp !== false ? "1" : "0",
      isEmail: options?.sendEmail !== false ? "1" : "0",
      data: [
        {
          sno: "1",
          userName,
          countryCode: options?.countryCode || "+91",
          mobileNumber,
          rewardAmount: rewardAmount.toString(),
          entityId: options?.entityId || "1886",
          transactionId: `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`
        }
      ]
    };
  }
}
