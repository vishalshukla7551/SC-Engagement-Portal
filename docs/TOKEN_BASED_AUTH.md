# Token-Based Authentication Architecture

## Overview

This implementation uses **tokens (HTTP-only cookies) as the single source of truth** for authentication. localStorage is only used for UI display purposes.

## Architecture

```
┌─────────────────────────────────────────┐
│    HTTP-only Cookie (JWT Token)         │
│  ✅ Secure (user can't access/modify)   │
│  ✅ Single source of truth              │
│  ✅ Verified on every request           │
└─────────────────────────────────────────┘
           ↓ (verified by server)
┌─────────────────────────────────────────┐
│      Database (Latest user data)        │
│  ✅ Authoritative source                │
│  ✅ Real-time role/permissions          │
└─────────────────────────────────────────┘
           ↓ (sent to client)
┌─────────────────────────────────────────┐
│    localStorage (UI display only)       │
│  ❌ Not used for auth decisions         │
│  ❌ Can be manipulated (doesn't matter) │
└─────────────────────────────────────────┘
```

## Key Components

### 1. `useRequireAuth()` Hook
**Location:** `src/lib/clientAuth.ts`

Automatically extracts required role from URL and verifies tokens:

```typescript
// Usage in any protected page
'use client';
import { useRequireAuth } from '@/lib/clientAuth';

export default function SECProfilePage() {
  const { user, loading, error } = useRequireAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return <div>Welcome, {user?.username}</div>;
}
```

**Features:**
- Extracts required role from URL path (e.g., `/SEC/profile` → requires `SEC` role)
- Verifies tokens with server on every page load
- Automatically redirects unauthorized users to their correct role's home
- Updates localStorage for UI display only

### 2. `/api/auth/verify` Endpoint
**Location:** `src/app/api/auth/verify/route.ts`

Server-side token verification endpoint:

```typescript
GET /api/auth/verify
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "role": "SEC",
    "username": "user@example.com",
    "validation": "APPROVED",
    "profile": { ... }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

## URL to Role Mapping

The hook automatically maps URL segments to required roles:

| URL Segment | Required Role |
|---|---|
| `/SEC/*` | `SEC` |
| `/ASE/*` | `ASE` |
| `/ABM/*` | `ABM` |
| `/ZSM/*` | `ZSM` |
| `/ZSE/*` | `ZSE` |
| `/Zopper-Administrator/*` | `ZOPPER_ADMINISTRATOR` |
| `/Samsung-Administrator/*` | `SAMSUNG_ADMINISTRATOR` |

## Flow Diagram

### Successful Authentication
```
User visits /SEC/profile
    ↓
useRequireAuth() runs
    ↓
Extract role from URL: 'SEC'
    ↓
Call /api/auth/verify
    ↓
Server verifies JWT token from HTTP-only cookie
    ↓
Database confirms user role: 'SEC'
    ↓
Roles match ✅
    ↓
Update localStorage for UI
    ↓
Page renders with user data
```

### Unauthorized Access
```
User visits /ASE/passbook (but user role = 'SEC')
    ↓
useRequireAuth() runs
    ↓
Extract role from URL: 'ASE'
    ↓
Call /api/auth/verify
    ↓
Server returns user role: 'SEC'
    ↓
Roles don't match ❌
    ↓
Show error message
    ↓
Redirect to /SEC/page (user's correct home)
```

### Invalid/Expired Token
```
User visits any protected page
    ↓
useRequireAuth() runs
    ↓
Call /api/auth/verify
    ↓
Server finds no valid token
    ↓
Return 401 Unauthorized
    ↓
Trigger clientLogout()
    ↓
Clear cookies + localStorage
    ↓
Redirect to /login/role
```

## Security Benefits

1. **Tokens are the source of truth** - User can't manipulate authentication
2. **HTTP-only cookies** - JavaScript can't access tokens (prevents XSS attacks)
3. **Server-side verification** - Every request is validated
4. **Token rotation** - Refresh tokens automatically rotate access tokens
5. **Real-time role changes** - Database is checked on every page load
6. **Automatic logout** - Invalid/expired tokens trigger immediate logout

## Implementation Checklist

- [x] `useRequireAuth()` hook with URL-based role extraction
- [x] `/api/auth/verify` endpoint for token verification
- [x] HTTP-only cookie support
- [x] Automatic role-based redirects
- [x] localStorage for UI display only
- [x] Error handling and unauthorized access messages

## Migration Guide

If you have existing pages using the old `useRequireAuth(requiredRoles)` pattern:

**Before:**
```typescript
const { user, loading } = useRequireAuth(['SEC']);
```

**After:**
```typescript
const { user, loading, error } = useRequireAuth();
// Role is automatically extracted from URL
```

Just ensure the page is in the correct URL path (e.g., `/SEC/profile` for SEC users).

## Troubleshooting

### User keeps getting logged out
- Check if JWT tokens are being set as HTTP-only cookies
- Verify token expiry times in `.env`
- Check browser console for `/api/auth/verify` errors

### Unauthorized message appears
- Verify user's role in database matches URL requirement
- Check URL_TO_ROLE_MAP in `src/lib/clientAuth.ts`
- Ensure user has `validation: 'APPROVED'` in database

### localStorage shows wrong role
- This is expected and doesn't affect authentication
- Tokens (HTTP-only cookies) are the source of truth
- localStorage is only for UI display
