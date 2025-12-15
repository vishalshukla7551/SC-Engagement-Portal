# Test: Number Of SECs Dropdown

## Changes Made:
1. **Replaced "Units Above Gate"** with "Number Of SECs"
2. **Added dropdown** with options 1, 2, 3, 4, 5
3. **Updated MonthlyTxn type** to include `latestSaleDate` property

## How to Test:
1. Go to SEC Passbook: `http://localhost:3003/SEC/passbook`
2. Click on "View Your Calculation" button for any month
3. In the incentive breakdown modal, you should see:
   - **Label**: "Number Of SECs" (instead of "Units Above Gate")
   - **Dropdown**: With options 1, 2, 3, 4, 5
   - **Default**: Should show 3 (as per existing state)

## Expected Behavior:
- ✅ Dropdown shows options 1-5
- ✅ User can select different values
- ✅ Selection is stored in `numberOfSECs` state
- ✅ Modal styling matches existing design
- ✅ No TypeScript errors

## UI Changes:
- **Before**: "Units Above Gate" with static "N/A" value
- **After**: "Number Of SECs" with interactive dropdown (1-5)

The dropdown uses the same styling as other dropdowns in the modal for consistency.