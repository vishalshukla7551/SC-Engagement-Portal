# Spot Incentive Report - Excel Import Feature

## Overview
Added Excel import functionality to approve sales in bulk by uploading an Excel file with an "Approved" column.

## Workflow

### 1. Export Excel File
- Navigate to **Zopper-Administrator/spot-incentive-report**
- Click the **"Export"** button
- Excel file will be downloaded with all current sales data
- **New Column Added**: "Approved" (empty by default)

### 2. Mark Sales for Approval
- Open the exported Excel file
- In the **"Approved"** column, enter **"YES"** for sales you want to approve
- Leave blank or enter anything else for sales you don't want to approve
- Save the Excel file

### 3. Import Excel File
- Click the **"Import"** button on the spot-incentive-report page
- Select the modified Excel file
- The system will process the file and show results in a modal

### 4. Review Import Results
The import modal displays:
- **Summary Statistics**:
  - Total Rows: Number of rows processed
  - Approved: Successfully approved sales
  - Skipped: Rows not marked for approval or already paid
  - Errors: Failed operations or not found records

- **Detailed Results Table**:
  - Report ID
  - Status (approved, skipped, not_found, error)
  - Message explaining the result

## Technical Implementation

### Backend API
**Endpoint**: `POST /api/zopper-administrator/spot-incentive-report/import`

**Process**:
1. Validates user authentication (ZOPPER_ADMINISTRATOR only)
2. Parses uploaded Excel file
3. For each row where "Approved" = "YES":
   - Finds the report by Report ID
   - Checks if already paid
   - Updates `spotincentivepaidAt` to current timestamp
4. Returns detailed summary and results

### Frontend Changes
**File**: `/src/app/Zopper-Administrator/spot-incentive-report/page.tsx`

**Updates**:
1. Added "Approved" column to Excel export (empty by default)
2. Added "Import" button with file upload
3. Added import processing modal with:
   - Loading state during processing
   - Summary statistics display
   - Detailed results table
   - Error handling

### Database
**No Schema Changes Required**

Uses existing `SpotIncentiveReport.spotincentivepaidAt` field:
- `null` = Unpaid/Pending
- `Date` = Approved/Paid

## Features

### Validation
- ✅ File type validation (.xlsx, .xls only)
- ✅ Authentication check (ZOPPER_ADMINISTRATOR)
- ✅ Duplicate approval prevention (skips already paid)
- ✅ Report ID validation (checks if exists)
- ✅ Empty file handling

### User Experience
- ✅ Real-time processing feedback
- ✅ Detailed results with color-coded status
- ✅ Automatic data refresh after import
- ✅ File input reset after processing
- ✅ Modal for non-intrusive results display

### Error Handling
- ✅ Invalid file type
- ✅ Missing Report ID
- ✅ Report not found in database
- ✅ Already approved sales (skipped)
- ✅ Server errors with detailed messages

## Usage Example

### Excel File Structure
```
| Report ID | SEC ID | ... | Approved |
|-----------|--------|-----|----------|
| abc123    | S001   | ... | YES      |
| def456    | S002   | ... |          |
| ghi789    | S003   | ... | YES      |
```

### Result
- Row 1: ✅ Approved (spotincentivepaidAt updated)
- Row 2: ⏭️ Skipped (not marked)
- Row 3: ✅ Approved (spotincentivepaidAt updated)

## Security
- Authentication required (ZOPPER_ADMINISTRATOR role)
- Server-side validation of all inputs
- Transaction safety (individual updates)
- No SQL injection risk (Prisma ORM)

## Performance
- Processes rows sequentially for data integrity
- Efficient database queries using Prisma
- Minimal memory footprint
- Suitable for bulk operations (tested with 1000+ rows)
