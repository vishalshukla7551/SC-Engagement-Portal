# Test Fold 7 and S25 Series Sold Calculation

## Issue
The "Fold 7 Sold" and "S25 Series Sold" rows in the incentive breakdown modal are showing 0 instead of the actual device counts.

## Root Cause
The frontend was making a POST request to `/api/sec/incentive/calculate`, but the API only supports GET requests with query parameters.

## Fix Applied
1. Changed the API call from POST to GET
2. Added proper query parameter parsing for `secId`, `month`, and `year`
3. Added logic to parse month from "Jan 24" format to month number and year
4. Added SEC ID retrieval from the profile API

## Code Changes
- Modified the fetch call in `src/app/SEC/passbook/page.tsx` around line 784
- Changed from POST with JSON body to GET with query parameters
- Added month/year parsing logic
- Added SEC ID retrieval

## Expected Behavior
After the fix:
1. The "View Your Calculation" button should successfully call the incentive calculation API
2. The API should return proper breakdown data with device-specific bonuses
3. "Fold 7 Sold" should show the count of Fold devices from the breakdown data
4. "S25 Series Sold" should show the count of S25 devices from the breakdown data

## Testing
To test this fix:
1. Navigate to SEC Passbook
2. Click on "View Your Calculation" for any month
3. Check that "Fold 7 Sold" and "S25 Series Sold" show correct values (not 0)
4. Verify the breakdown table shows device bonuses properly

## API Response Structure
The API should return data in this format:
```json
{
  "success": true,
  "data": {
    "breakdownByStore": [{
      "breakdownBySlab": [{
        "deviceBonuses": {
          "foldBonus": 600,
          "s25Bonus": 500
        },
        "units": 5
      }]
    }]
  }
}
```

The frontend calculates device counts by checking which slabs have `foldBonus > 0` or `s25Bonus > 0`.