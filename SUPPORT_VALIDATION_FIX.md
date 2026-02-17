# Support Page Validation Error Fix

## Issue
The SEC support page was showing a validation error in the console:
```
Validation Error in my-query: {}
```

This error occurred when the page tried to fetch the user's active support query on page load.

## Root Cause
The error was caused by one of the following scenarios:

1. **Invalid User ID Format**: The `userId` (SEC ID) stored in localStorage might not be a valid MongoDB ObjectId (24-character hexadecimal string)
2. **Missing User ID**: The `id` field might be undefined or null
3. **Empty Error Object**: The validation error response wasn't providing detailed error information

## Changes Made

### 1. Frontend Enhancements (`src/app/SEC/support/page.tsx`)

**Added Client-Side Validation:**
- Validates that `userId` exists before making API request
- Validates that `userId` matches MongoDB ObjectId format (24-character hex string)
- Provides clear console logs showing:
  - The userId being sent
  - Its type and length
  - Why validation failed (if it did)

**Improved Error Handling:**
- Added handling for all non-OK responses, not just 400
- Enhanced error logging with full context

### 2. Backend Enhancements (`src/app/api/sec/support/my-query/route.ts`)

**Added Detailed Error Responses:**
- Each validation error now includes:
  - `error`: Human-readable error message
  - `code`: Machine-readable error code (e.g., `MISSING_SEC_ID`, `INVALID_SEC_ID_FORMAT`)
  - `received`: The actual value received
  - `receivedType`: The type of the value
  - `length`: The length (for strings)
  - `expectedFormat`: What format was expected

**Added Server-Side Logging:**
- Logs all incoming requests with:
  - The secId value
  - Its type and length
  - All body keys
- Logs detailed validation failure information

## How This Helps

### Before:
```
Validation Error in my-query: {}
```
(No useful information)

### After (Missing ID):
```
Cannot fetch active query: userId is missing
```

### After (Invalid Format):
```
Cannot fetch active query: Invalid ObjectId format
{
  userId: "12345",
  length: 5,
  expected: "24-character hexadecimal string"
}
```

### After (API Error):
```
Validation Error in my-query:
{
  status: 400,
  errorData: {
    error: "Invalid SEC ID format",
    code: "INVALID_SEC_ID_FORMAT",
    received: "12345",
    receivedType: "string",
    length: 5,
    expectedFormat: "24-character hexadecimal string"
  },
  sentUserId: "12345",
  userIdType: "string",
  userIdLength: 5
}
```

## Next Steps

1. **Check Browser Console**: The enhanced logging will show exactly what's happening
2. **Check Terminal**: Server-side logs will show what the API received
3. **Verify User Session**: If the error persists, check the stored user object in localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('authUser'))
   ```
   The `id` field should be a 24-character hexadecimal string like: `507f1f77bcf86cd799439011`

## Possible Resolution

If the issue is that old user sessions have an invalid `id` field, users may need to:
1. Log out
2. Log back in

This will refresh their session with the correct ObjectId format (which is already being returned from the verify-otp API at line 105).
