# Server-side Video Template Matching - Implementation Tasks

## Task Overview
Fix server-side video generation to exactly match frontend templates, generate 9:16 vertical videos, and include audio synchronization.

## Task List

### Phase 1: Core Template System Updates

- [ ] 1. Update slide definitions to match frontend exactly
  - [ ] 1.1 Replace current SLIDES array with frontend slide structure
  - [ ] 1.2 Add all slide types: intro, stats, rank, leaderboard, badges, hall-of-fame, outro
  - [ ] 1.3 Map slide durations to match frontend timing
  - [ ] 1.4 Add PatrioticBackground variant mapping for each slide

- [ ] 2. Implement PatrioticBackground variant system
  - [ ] 2.1 Create background variant generator functions
  - [ ] 2.2 Implement 'default' variant (tricolor gradients + Ashoka Chakra)
  - [ ] 2.3 Implement 'radar' variant (grid lines + radar sweep)
  - [ ] 2.4 Implement 'spotlight' variant (dramatic lighting + moving beams)
  - [ ] 2.5 Implement 'regal' variant (gold vignette + tricolor patterns)
  - [ ] 2.6 Implement 'rising' variant (rising particles effect)
  - [ ] 2.7 Implement 'cobra' variant (hexagonal tech pattern)
  - [ ] 2.8 Implement 'battalion' variant (topographic lines + crosshairs)
  - [ ] 2.9 Implement 'honor' variant (flowing tricolor bands)
  - [ ] 2.10 Implement 'elite' variant (laser beams + explosive burst)
  - [ ] 2.11 Implement 'laser' variant (vertical laser beams + particles)

### Phase 2: Slide Template Implementation

- [ ] 3. Create intro slide template
  - [ ] 3.1 Implement saffron "Jai Hind" header with rotation and styling
  - [ ] 3.2 Create "YODDHA WRAPPED" text with gradient and skew effects
  - [ ] 3.3 Add "Operation 2026 Successful" badge with proper styling
  - [ ] 3.4 Integrate PatrioticBackground default variant
  - [ ] 3.5 Ensure exact visual match with frontend intro slide

- [ ] 4. Create stats slide template
  - [ ] 4.1 Implement radar background with grid lines and sweep animation
  - [ ] 4.2 Create tech-style container with scanning line effect
  - [ ] 4.3 Add animated number display for points, units sold, streak
  - [ ] 4.4 Implement status lights and tech grid overlay
  - [ ] 4.5 Match frontend stats slide layout and styling exactly

- [ ] 5. Create rank slide template
  - [ ] 5.1 Implement laser background with vertical beams
  - [ ] 5.2 Add rank logic for percentage vs achievement text display
  - [ ] 5.3 Create crown icon and gradient backgrounds
  - [ ] 5.4 Implement proper rank title and description formatting
  - [ ] 5.5 Handle all rank types: Chief Marshal, Commander, Major, etc.

- [ ] 6. Create leaderboard slide template
  - [ ] 6.1 Implement battalion background with topographic lines
  - [ ] 6.2 Create regional ranking display with proper formatting
  - [ ] 6.3 Add rank number display with styling
  - [ ] 6.4 Implement progress bar with tricolor gradient
  - [ ] 6.5 Match frontend leaderboard slide exactly

- [ ] 7. Create badges slide template
  - [ ] 7.1 Implement ID card style layout with tricolor header
  - [ ] 7.2 Create avatar circle with user initials
  - [ ] 7.3 Add rank icon badge overlay system
  - [ ] 7.4 Implement stats grid with points and rank display
  - [ ] 7.5 Add holographic texture and rank comparison row
  - [ ] 7.6 Ensure exact match with frontend badges slide

- [ ] 8. Create hall-of-fame slide template
  - [ ] 8.1 Implement spotlight background with moving beams
  - [ ] 8.2 Create leaderboard list with proper user highlighting
  - [ ] 8.3 Add rank formatting and points display
  - [ ] 8.4 Implement user identification and styling
  - [ ] 8.5 Match frontend hall-of-fame slide layout

- [ ] 9. Create outro slide template
  - [ ] 9.1 Implement cobra background with hexagonal pattern
  - [ ] 9.2 Create "Mission Completed" text with proper styling
  - [ ] 9.3 Add share button placeholders (non-functional for video)
  - [ ] 9.4 Implement proper outro slide layout and effects

### Phase 3: Vertical Format Optimization

- [ ] 10. Update video dimensions for 9:16 format
  - [ ] 10.1 Change Puppeteer viewport to 720x1280 (9:16 ratio)
  - [ ] 10.2 Update all CSS layouts for vertical orientation
  - [ ] 10.3 Adjust font sizes for mobile viewing
  - [ ] 10.4 Optimize element positioning for vertical format
  - [ ] 10.5 Test all slides in vertical format

- [ ] 11. Optimize layouts for mobile viewing
  - [ ] 11.1 Ensure text readability at mobile scale
  - [ ] 11.2 Adjust spacing and padding for vertical layout
  - [ ] 11.3 Optimize image and icon sizes for mobile
  - [ ] 11.4 Test content visibility and positioning

### Phase 4: Audio Integration

- [ ] 12. Implement audio loading and processing
  - [ ] 12.1 Create audio file loader for MP3 format
  - [ ] 12.2 Implement audio decoding to AudioBuffer
  - [ ] 12.3 Add error handling for audio loading failures
  - [ ] 12.4 Create audio format validation

- [ ] 13. Add audio-video synchronization
  - [ ] 13.1 Calculate total video duration from slide timings
  - [ ] 13.2 Implement audio looping to match video duration
  - [ ] 13.3 Create audio trimming for shorter videos
  - [ ] 13.4 Add audio fade-in/fade-out effects

- [ ] 14. Integrate audio encoding with video
  - [ ] 14.1 Update MP4 muxer configuration for audio
  - [ ] 14.2 Implement AAC audio encoding
  - [ ] 14.3 Synchronize audio chunks with video frames
  - [ ] 14.4 Add audio quality optimization

### Phase 5: Data Processing and Logic

- [ ] 15. Implement exact frontend data processing
  - [ ] 15.1 Create data transformation layer matching frontend
  - [ ] 15.2 Implement rank logic exactly as frontend
  - [ ] 15.3 Add leaderboard data formatting
  - [ ] 15.4 Create hall-of-fame data processing
  - [ ] 15.5 Ensure all data calculations match frontend exactly

- [ ] 16. Add frontend rank logic replication
  - [ ] 16.1 Implement percentage calculation for high ranks
  - [ ] 16.2 Add "Better Luck next time" logic for 0 points
  - [ ] 16.3 Create "KEEP GOING" logic for Lieutenant rank
  - [ ] 16.4 Add "GREAT START" logic for Salesveer rank
  - [ ] 16.5 Test all rank scenarios

### Phase 6: CSS Framework and Animations

- [ ] 17. Create comprehensive CSS framework
  - [ ] 17.1 Implement base styles for vertical format
  - [ ] 17.2 Add patriotic color scheme variables
  - [ ] 17.3 Create responsive typography system
  - [ ] 17.4 Implement layout utilities for vertical orientation

- [ ] 18. Convert Framer Motion animations to CSS
  - [ ] 18.1 Create CSS keyframe animations for spin effects
  - [ ] 18.2 Implement radar sweep animation
  - [ ] 18.3 Add laser beam animations
  - [ ] 18.4 Create particle movement effects
  - [ ] 18.5 Implement gradient movement animations

### Phase 7: Quality Assurance and Testing

- [ ] 19. Implement template validation system
  - [ ] 19.1 Create visual comparison tools
  - [ ] 19.2 Add color accuracy validation
  - [ ] 19.3 Implement layout measurement checks
  - [ ] 19.4 Create automated screenshot comparison

- [ ] 20. Add comprehensive testing
  - [ ] 20.1 Test all slide types with various data scenarios
  - [ ] 20.2 Validate vertical format output
  - [ ] 20.3 Test audio synchronization
  - [ ] 20.4 Verify template matching with frontend
  - [ ] 20.5 Test error handling and fallback scenarios

### Phase 8: Performance and Error Handling

- [ ] 21. Optimize performance for server environment
  - [ ] 21.1 Implement efficient memory management
  - [ ] 21.2 Add resource cleanup between generations
  - [ ] 21.3 Optimize frame generation process
  - [ ] 21.4 Add concurrent generation support

- [ ] 22. Enhance error handling and fallbacks
  - [ ] 22.1 Add graceful degradation for audio failures
  - [ ] 22.2 Implement retry mechanisms for transient failures
  - [ ] 22.3 Add detailed error logging and reporting
  - [ ] 22.4 Create fallback to image sequence if video fails

### Phase 9: Integration and Deployment

- [ ] 23. Update API endpoints and integration
  - [ ] 23.1 Update video generation API to use new templates
  - [ ] 23.2 Ensure backward compatibility with existing calls
  - [ ] 23.3 Update progress tracking for new generation process
  - [ ] 23.4 Test end-to-end video generation flow

- [ ] 24. Final validation and deployment
  - [ ] 24.1 Perform comprehensive testing with real user data
  - [ ] 24.2 Validate video quality and format
  - [ ] 24.3 Test audio quality and synchronization
  - [ ] 24.4 Verify template accuracy against frontend
  - [ ] 24.5 Deploy and monitor initial usage

## Success Criteria
- [ ] All frontend slide types are accurately represented in server-side generation
- [ ] Videos are generated in 9:16 vertical format suitable for mobile sharing
- [ ] Background music is properly integrated and synchronized
- [ ] Visual quality matches frontend experience exactly
- [ ] No missing or mismatched slides between frontend and server versions
- [ ] Generation completes reliably within 2 minutes
- [ ] Audio quality is clear and properly mixed
- [ ] All PatrioticBackground variants are implemented correctly

## Notes
- Focus on exact visual matching with frontend components
- Prioritize mobile-optimized vertical format
- Ensure audio integration doesn't compromise video quality
- Test thoroughly with various user data scenarios
- Maintain performance standards for server environment