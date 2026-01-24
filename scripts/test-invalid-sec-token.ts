import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || '';
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface AuthTokenPayload {
  userId?: string;
  secId?: string;
  role: string;
  projectId: string;
}

function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

function signRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL_SECONDS });
}

// Generate tokens for SEC with INVALID/RANDOM secId
const invalidSecId = '9999999999'; // Random phone number that doesn't exist in DB

const payload: AuthTokenPayload = {
  secId: invalidSecId,
  role: 'SEC',
  projectId: process.env.PROJECT_ID || 'samsung',
};

const accessToken = signAccessToken(payload);
const refreshToken = signRefreshToken(payload);

console.log('\n=== TEST TOKENS FOR INVALID SEC USER ===\n');
console.log('SEC ID (Phone):', invalidSecId);
console.log('Role:', payload.role);
console.log('Project ID:', payload.projectId);
console.log('\n--- ACCESS TOKEN ---');
console.log(accessToken);
console.log('\n--- REFRESH TOKEN ---');
console.log(refreshToken);

console.log('\n=== HOW TO TEST ===\n');
console.log('1. Open browser DevTools → Application → Cookies');
console.log('2. Set these cookies for your domain:');
console.log('   - Name: access_token');
console.log('   - Value: <access_token_above>');
console.log('   - Path: /');
console.log('   - HttpOnly: true');
console.log('   - SameSite: Lax');
console.log('\n3. Visit http://localhost:3000/SEC/profile');
console.log('4. Check what happens when secId is not in database');
console.log('\n=== EXPECTED BEHAVIOR (AFTER FIX) ===');
console.log('- Token is valid (JWT signature correct)');
console.log('- But secId (9999999999) does not exist in SEC table');
console.log('- Auth should REJECT the token and clear cookies');
console.log('- User should be logged out and redirected to login');
console.log('- Should NOT allow access to SEC pages\n');
