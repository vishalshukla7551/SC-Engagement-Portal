# UAT (User Acceptance Testing) Environment Implementation

## Overview
UAT environment allows testing of specific features with restricted access. UAT users can only access the Spot Incentive Report page and see data for their assigned SEC only.

## Setup

### 1. Environment Variables
Add to `.env`:
```env
UAT_SEC_PHONE=<phone_number_of_uat_sec>
```

### 2. Create UAT User
Create a user in the database with:
```json
{
  "username": "uat_admin",
  "role": "ZOPPER_ADMINISTRATOR",
  "metadata": {
    "isUatUser": true
  }
}
```

### 3. Assign SEC to UAT User
The UAT user will be linked to the SEC with phone number matching `UAT_SEC_PHONE`.

## Frontend Implementation

### Layout Protection (`src/app/Zopper-Administrator/layout.tsx`)

**Features:**
- Detects UAT user from `user.metadata.isUatUser`
- Auto-redirects to `/Zopper-Administrator/spot-incentive-report` if accessing restricted routes
- Filters sidebar to show only "Spot Incentive" menu item for UAT users
- Shows loading screen during redirect

**Restricted Routes:**
- Home
- Past Campaigns
- Customer Love Index
- Monthly Incentive Report
- Referral
- User Validation
- Store Change Requests
- Help Requests
- Voucher Excel Processing
- Store Attach Rate Import
- Daily Reports Import
- Invalid IMEIs Processing
- Test Panel

## Backend API Protection

### Utility Function (`src/lib/uatRestriction.ts`)

```typescript
checkUatRestriction(authUser, allowedForUat = false)
```

- Returns `403 Forbidden` if UAT user tries to access restricted endpoint
- Returns `null` if access is allowed
- Use `allowedForUat = true` for endpoints that should allow UAT users

### Protected Endpoints

#### 1. Leaderboard API
- **File:** `src/app/api/zopper-administrator/leaderboard/route.ts`
- **Status:** ✅ Protected
- **UAT Access:** Blocked (403)

#### 2. Store Requests API
- **File:** `src/app/api/zopper-administrator/store-requests/route.ts`
- **Status:** ✅ Protected
- **UAT Access:** Blocked (403)

#### 3. Spot Incentive Report API (Special Case)
- **File:** `src/app/api/zopper-administrator/spot-incentive-report/route.ts`
- **Status:** ✅ Protected with filtering
- **UAT Access:** Allowed with filtering
- **Behavior:**
  - UAT users: See only their assigned SEC's reports
  - Real admins: See all reports except UAT SEC's reports
  - Returns `isUatAdmin` flag in response

## Testing Checklist

### Frontend Testing
- [ ] Login as UAT user
- [ ] Verify redirected to spot-incentive-report on page load
- [ ] Verify sidebar shows only "Spot Incentive" menu item
- [ ] Try accessing other routes manually - should redirect
- [ ] Verify loading screen appears during redirect

### API Testing
- [ ] UAT user calls `/api/zopper-administrator/leaderboard` → 403 error
- [ ] UAT user calls `/api/zopper-administrator/store-requests` → 403 error
- [ ] UAT user calls `/api/zopper-administrator/spot-incentive-report` → Returns only their SEC's data
- [ ] Real admin calls same endpoints → Works normally, excludes UAT SEC data
- [ ] Real admin calls spot-incentive-report → `isUatAdmin: false` in response
- [ ] UAT user calls spot-incentive-report → `isUatAdmin: true` in response

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/uatRestriction.ts` | UAT utility functions |
| `src/app/Zopper-Administrator/layout.tsx` | Frontend route protection & menu filtering |
| `src/app/api/zopper-administrator/spot-incentive-report/route.ts` | Custom filtering for UAT users |
| `src/app/api/zopper-administrator/leaderboard/route.ts` | Protected endpoint |
| `src/app/api/zopper-administrator/store-requests/route.ts` | Protected endpoint |

## Data Isolation

### UAT User Data Flow
```
UAT User Login
    ↓
Check metadata.isUatUser = true
    ↓
Get UAT_SEC_PHONE from env
    ↓
Find SEC by phone
    ↓
Redirect to spot-incentive-report
    ↓
API filters: where.secId = UAT_SEC.id
    ↓
Return only that SEC's reports
```

### Real Admin Data Flow
```
Real Admin Login
    ↓
Check metadata.isUatUser = false
    ↓
Access all routes
    ↓
API filters: where.secId = { not: UAT_SEC.id }
    ↓
Return all reports except UAT SEC's
```

## Security Notes

1. **Frontend Protection:** Redirects are for UX only, not security
2. **Backend Protection:** API endpoints enforce restrictions via `checkUatRestriction()`
3. **Data Isolation:** Database queries filter data at query level
4. **Environment Variable:** `UAT_SEC_PHONE` must be set for UAT to work
5. **Metadata Flag:** `isUatUser` is the source of truth for UAT status

## Future Enhancements

- [ ] Add UAT user audit logging
- [ ] Create UAT user management dashboard
- [ ] Add time-based UAT access (expiry dates)
- [ ] Support multiple UAT users with different SECs
- [ ] Add UAT-specific reports/analytics
