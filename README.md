# My Chat App

This repository contains both the web and mobile applications for My Chat App.

## Prerequisites

- Node.js installed
- npm or yarn
- Expo Go app on your mobile device (for testing mobile app)

## Web Application

The web application is located in the `web app` directory.

### Setup & Run

1. Navigate to the web app directory:
   ```bash
   cd "web app"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
   This will start the web app and make it accessible on your local network.

## Mobile Application

The mobile application is located in the `mobile_new` directory.

### Setup & Run

1. Navigate to the mobile app directory:
   ```bash
   cd mobile_new
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start --clear
   ```
   Scan the QR code with the Expo Go app on your Android or iOS device to run the app.

## Project Structure

- `web app/`: Source code for the web client.
- `mobile_new/`: Source code for the React Native mobile app (Expo).
