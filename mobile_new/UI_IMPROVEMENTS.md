# Mobile UI Improvements

We have significantly enhanced the visual design of the mobile application with a modern, consistent theme.

## Key Changes

### 1. New Design System (`src/utils/theme.js`)
- **Color Palette**: Introduced a vibrant "Modern Indigo" palette.
  - Primary: `#6C63FF` (Indigo/Purple)
  - Background: `#F3F4F6` (Cool Gray)
  - Surface: `#FFFFFF` (White) with `#F9FAFB` (Alt Surface)
- **Typography and Shadows**: Standardized spacing, border radiuses, and shadow depths for a premium feel.

### 2. Login Screen
- **Card Layout**: Moved login form into a clean, shadowed card.
- **Visual Hierarchy**: Added a logo placeholder, better typography for titles, and clearer distinction between primary actions and secondary options.
- **Inputs**: improved input field styling with better padding and focus states.

### 3. Chat Screen
- **Modern Message Bubbles**: 
  - "My" messages use the primary color with a "speech bubble" corner.
  - "Their" messages use a white surface with subtle shadows.
- **Floating Input Bar**: The message input is now a floating pill-shaped bar with a circular send button, typical of modern chat apps.
- **Connection Status**: The offline/online indicator is now a subtle status bar below the header.
- **Navigation Header**: The app header now uses the primary brand color.

### 4. QR Scan Screen
- **Consolidated UI**: Updated overlay text and buttons to match the new design language, ensuring the camera view remains the focus while controls are clearly visible and accessible.

## How to Test
1. Run the app: `npx expo start`
2. Open on your device or simulator.
3. Observe the new "Welcome Back" login screen.
4. Navigate to the Chat screen to see the updated message bubbles and input field.
