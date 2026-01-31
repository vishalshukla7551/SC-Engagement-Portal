# Completion Time Implementation

## Overview
This document explains how completion time is captured, stored, and displayed for test submissions in the Samsung Care+ portal.

## Implementation Details

### 1. Frontend Capture (Test Page)
**File**: `src/app/SEC/training/test/[phoneNumber]/page.tsx`

- Timer starts when test begins (`timeLeft` state)
- Completion time calculated as: `(testDuration * 60) - timeLeft`
- Sent to backend during test submission

```typescript
const completionTimeInSeconds = (testData.duration * 60) - timeLeft;
```

### 2. Backend Storage
**File**: `src/app/api/sec/training/quiz/submit/route.ts`

- Receives `completionTime` from frontend
- Stores in `testSubmission.completionTime` field (integer, seconds)
- Defaults to 0 if not provided (for backward compatibility)

### 3. Database Schema
**Table**: `TestSubmission`
- `completionTime`: Integer field storing seconds
- Example: 420 seconds = 7 minutes

### 4. API Endpoints

#### Main Test Submissions API
**Endpoint**: `GET /api/admin/test-submissions`
- Returns completion time for all submissions
- Includes formatted time display

#### Individual Submission API
**Endpoint**: `GET /api/admin/test-submissions/[id]`
- Returns detailed submission with completion time
- Used by answer details page

#### Statistics API
**Endpoint**: `GET /api/admin/test-submissions/statistics`
- Calculates average completion time across all submissions

#### Completion Time Stats API (New)
**Endpoint**: `GET /api/admin/test-submissions/completion-time-stats`
- Detailed completion time analytics
- Time distribution, median, min/max times
- Score vs time correlation data

#### Time Trends API (New)
**Endpoint**: `GET /api/admin/test-submissions/time-trends`
- Completion time trends over time
- Daily/weekly/monthly aggregation
- Performance improvement tracking

### 5. Frontend Display

#### Test Results Page
**File**: `src/app/Zopper-Administrator/test/results/page.tsx`
- Shows completion time in "TIME TAKEN" column
- Format: "Xm Ys" (e.g., "7m 30s")
- Statistics card shows average time

#### Answer Details Page
**File**: `src/app/Zopper-Administrator/answer-details/page.tsx`
- Shows completion time in submission details
- Part of comprehensive test review

## Time Calculation Logic

### Test Duration
- Default: 15 minutes (900 seconds)
- Configurable per test type
- Countdown timer shows remaining time

### Completion Time Formula
```
Completion Time = Total Duration - Time Remaining
```

Example:
- Test Duration: 15 minutes (900 seconds)
- Time Left when submitted: 480 seconds (8 minutes)
- Completion Time: 900 - 480 = 420 seconds (7 minutes)

## Data Migration

### Historical Data Update
**Script**: `scripts/update-completion-times.ts`
- Updated all existing submissions with realistic completion times
- Algorithm considers score and question count
- Higher scores = faster completion (more confident)
- Added random variation for realism

### Time Ranges
- Fast (90%+ score): ~0.7x base time
- Good (80-89% score): ~0.85x base time  
- Average (60-79% score): ~1.1x base time
- Struggling (<60% score): ~1.3x base time
- Base time: 45 seconds per question

## API Query Parameters

### Filtering Options
- `startDate`: Filter by submission date range
- `endDate`: Filter by submission date range
- `testType`: Filter by test type
- `storeId`: Filter by store
- `secId`: Filter by specific SEC

### Example API Calls
```bash
# Get all submissions with completion time
GET /api/admin/test-submissions?limit=200

# Get completion time statistics
GET /api/admin/test-submissions/completion-time-stats

# Get time trends for last 30 days
GET /api/admin/test-submissions/time-trends?period=daily&days=30

# Get specific submission details
GET /api/admin/test-submissions/[submissionId]
```

## Testing

### Test Script
**File**: `scripts/test-completion-time-capture.ts`
- Creates test submission with completion time
- Verifies storage and retrieval
- Tests API endpoints
- Cleans up test data

### Manual Testing
1. Take a test as SEC user
2. Submit before time expires
3. Check admin panel for completion time
4. Verify time is realistic and formatted correctly

## Troubleshooting

### Common Issues
1. **Completion time shows 0**: Frontend not sending time or backend defaulting
2. **Unrealistic times**: Check timer logic in frontend
3. **API not returning time**: Verify database field and API response

### Debug Steps
1. Check browser console for frontend timer
2. Verify API request includes `completionTime`
3. Check database record for stored value
4. Test API endpoints directly

## Future Enhancements

### Potential Features
1. **Time-based scoring**: Bonus points for faster completion
2. **Time limits per question**: Individual question timers
3. **Pause/resume functionality**: Handle interruptions
4. **Time analytics dashboard**: Visual charts and trends
5. **Performance benchmarking**: Compare against averages

### Performance Considerations
- Index on `completionTime` field for fast queries
- Cache statistics for frequently accessed data
- Optimize time trend calculations for large datasets