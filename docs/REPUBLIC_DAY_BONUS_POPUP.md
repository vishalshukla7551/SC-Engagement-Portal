# Republic Day Bonus Popup Implementation

## Overview
Added an interactive popup that shows 25,000 bonus points to selected SEC users when they first visit the `/SEC/republic-day-hero` page.

## Features

### 1. **Eligibility Check**
- Popup only shows for users whose phone numbers are in the predefined bonus list
- 64 phone numbers are eligible for the bonus
- Check happens automatically on page load

### 2. **LocalStorage State Management**
- Popup state is saved in localStorage with key: `republic_day_bonus_shown`
- Once shown, the popup won't appear again for that user
- Prevents repeated popups on subsequent visits

### 3. **Visual Design**
- Tricolor gradient header (Saffron, Navy Blue, Green)
- Animated gift icon with rotation and scale effects
- Bonus amount displayed prominently with gradient text
- Smooth animations using Framer Motion
- Backdrop blur for focus

### 4. **User Experience**
- Shows message: "Thank you for your contribution in the Pitchsultan video creation!"
- Lists benefits of the bonus points
- Animated stars and decorative elements
- Close button and action button to dismiss

## Files Modified/Created

### New Files:
- `src/components/RepublicDayBonusPopup.tsx` - Main popup component

### Modified Files:
- `src/app/SEC/republic-day-hero/page.tsx` - Added import and component usage

## Implementation Details

### Component Props:
```typescript
interface RepublicDayBonusPopupProps {
  userPhone?: string;  // Optional: pass phone directly, otherwise fetches from authUser
}
```

### Bonus Phone Numbers:
```typescript
const BONUS_PHONE_NUMBERS = [
  "6377159886","9462008833","9928563176",...
  // 64 total phone numbers
];
```

### Constants:
- `BONUS_POINTS = 25000` - Points awarded
- `STORAGE_KEY = 'republic_day_bonus_shown'` - LocalStorage key

## How It Works

1. **On Page Load:**
   - Component checks if popup has been shown before (localStorage)
   - If not shown, fetches user phone from authUser in localStorage
   - Checks if phone is in bonus list

2. **If Eligible:**
   - Sets `isEligible` to true
   - Opens popup with animation
   - Saves state to localStorage

3. **User Interaction:**
   - User can close popup by clicking close button or action button
   - Popup won't show again for this user

## Styling

- Uses Tailwind CSS for responsive design
- Framer Motion for smooth animations
- Gradient backgrounds matching Republic Day theme
- Mobile-friendly with proper padding and sizing

## Integration

The component is integrated into the republic-day-hero page:

```tsx
<RepublicDayBonusPopup />
```

It automatically:
- Fetches user phone from localStorage
- Checks eligibility
- Shows popup if eligible and not previously shown
- Manages its own state

## Notes

- The popup is non-blocking and can be dismissed
- No backend changes needed - purely frontend implementation
- Bonus points display is informational (actual points should be added via backend)
- Works on both desktop and mobile devices
