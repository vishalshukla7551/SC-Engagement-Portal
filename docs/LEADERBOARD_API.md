# Leaderboard API Documentation

## Overview
The Leaderboard API provides rankings and statistics for stores, devices (Samsung SKUs), and plans based on sales reports from **active campaigns only**.

## Endpoint
```
GET /api/leaderboard
```

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `'month'` | Time period for leaderboard: `'week'`, `'month'`, or `'all'` |
| `limit` | number | `10` | Maximum number of results per category |

## Response Format

```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "rank": 1,
        "storeId": "string",
        "storeName": "string",
        "city": "string | null",
        "state": "string | null",
        "totalSales": 0,
        "totalIncentive": "₹0"
      }
    ],
    "devices": [
      {
        "rank": 1,
        "deviceId": "string",
        "deviceName": "string",
        "category": "string",
        "totalSales": 0,
        "totalIncentive": "₹0"
      }
    ],
    "plans": [
      {
        "rank": 1,
        "planId": "string",
        "planType": "string",
        "planPrice": "₹0",
        "totalSales": 0,
        "totalIncentive": "₹0"
      }
    ],
    "period": "month",
    "activeCampaignsCount": 0,
    "totalSalesReports": 0
  }
}
```

## Example Requests

### Get monthly leaderboard (default)
```bash
GET /api/leaderboard
```

### Get weekly leaderboard with top 5
```bash
GET /api/leaderboard?period=week&limit=5
```

### Get all-time leaderboard with top 20
```bash
GET /api/leaderboard?period=all&limit=20
```

## Business Logic

### Active Campaign Filtering
- Only includes sales reports linked to **active campaigns**
- Active campaigns must meet ALL criteria:
  - `active` field is `true`
  - Current date is between `startDate` and `endDate`
  - Campaign has a valid store, device (Samsung SKU), and plan

### Period Calculation
- **week**: Last 7 days from current date
- **month**: Current calendar month (from 1st to today)
- **all**: All time data

### Ranking Logic
- Rankings are based on **total sales count** (not incentive amount)
- Sorted in descending order (highest sales first)
- Ties are broken by the order they appear in the database

### Aggregation
Each category aggregates:
- **Total Sales**: Count of sales reports
- **Total Incentive**: Sum of `spotincentiveEarned` from all sales

## Use Cases

1. **Store Performance Dashboard**: Track which stores are performing best with active campaigns
2. **Product Insights**: Identify which Samsung devices are selling most under campaigns
3. **Plan Effectiveness**: Determine which protection plans are most popular
4. **Campaign ROI**: Monitor total incentives paid out per category

## Notes

- If no active campaigns exist, returns empty arrays for all categories
- Incentive amounts are formatted in Indian Rupee format (₹)
- The API does not require authentication (add if needed)
- All monetary values are displayed with Indian number formatting (e.g., ₹1,00,000)
