# Test: Volume Kicker Applicable Row

## Changes Made:
1. **Added new row** "Volume Kicker Applicable" after "Store Attach Rate"
2. **Dynamic calculation** shows "8 x [Number of SECs] = [Result]"
3. **Interactive** - updates when user changes the Number of SECs dropdown

## How to Test:
1. Go to SEC Passbook: `http://localhost:3003/SEC/passbook`
2. Click on "View Your Calculation" button for any month
3. In the incentive breakdown modal, you should see:
   - **"Volume Kicker Applicable"**: Shows calculation like "8 x 3 = 24"
4. Change the "Number Of SECs" dropdown and verify the calculation updates

## Logic Explanation:
- **Formula**: `8 x numberOfSECs = result`
- **Dynamic**: Updates in real-time when dropdown value changes
- **Examples**:
  - If SECs = 1: Shows "8 x 1 = 8"
  - If SECs = 3: Shows "8 x 3 = 24" 
  - If SECs = 5: Shows "8 x 5 = 40"

## Expected Behavior:
- ✅ Shows correct calculation based on selected number of SECs
- ✅ Updates immediately when dropdown value changes
- ✅ Maintains consistent styling with other rows
- ✅ Positioned correctly after "Store Attach Rate"
- ✅ No TypeScript errors

## Current Modal Structure:
```
Store Name: [Store Name - City]
Total Units Sold (till DD-MM-YYYY): [X]
Number Of SECs: [Dropdown: 1-5]
Fold 7 Sold: [X]
S25 Series Sold: [X]
Store Attach Rate: [X%]
Volume Kicker Applicable: 8 x [N] = [Result]  ← NEW ROW
Total Incentive Earned: [₹X,XXX]
Payment Status: [Accumulated]
```

The Volume Kicker Applicable row provides a clear calculation showing the volume kicker threshold based on the number of SECs selected.