# My Chat App

A secure, real-time chat application featuring a Web Dashboard and a Mobile App (React Native/Expo). This project demonstrates modern web/mobile integration, QR code authentication, and end-to-end encryption principles.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- **Expo Go** app installed on your physical mobile device (Android/iOS)
- Both devices (Laptop and Mobile) must be on the **same Wi-Fi network**.

---

### 1. Running the Web App
The web app acts as the server and the desktop client.

1. Navigate to the `web app` directory:
   ```bash
   cd "web app"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server and expose it to your network:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
   *Note: Using `-H 0.0.0.0` is crucial so your mobile device can reach the local server.*

4. Access the app in your browser at `http://localhost:3000`.

---

### 2. Running the Mobile App

1. Open a new terminal and navigate to the `mobile_new` directory:
   ```bash
   cd mobile_new
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start --clear
   ```
4. A QR code will appear in your terminal. **Scan this QR code using the Expo Go app** on your phone.

---

## Usage Guide

### Logging in on Web
1. Open `http://localhost:3000` (or your local IP address).
2. Register a new account or log in with an existing one.
3. You will be redirected to the chat dashboard.

### Logging in on Mobile (QR Code)
**Note:** You must be logged in on the Web App first.

1. On the Web App Chat Dashboard, click **"Login on mobile via QR →"** (top right).
2. A QR code will be displayed on your computer screen.
3. Open the **My Chat App** on your phone.
4. Tap **"Scan QR Code"** on the login screen.
5. Point your camera at the screen to scan the code.
6. The app will automatically log in and securely exchange encryption keys.

### Sending & Receiving Messages
- Messages sent from either device are synced in real-time using **Socket.io**.
- If the other device is offline, messages are stored in the database (MongoDB) and synced when reconnected.
- Messages are stored locally on the mobile device using an offline-first database approach.

### Export / Import Backup
You can move your chat history between devices manually using the JSON backup feature.

**On Web:**
- **Export:** Click the "Export" button in the chat header. The chat JSON is copied to your clipboard.
- **Import:** Click "Import", paste the JSON text, and click "Import".

**On Mobile:**
- **Export:** In the chat screen header, tap "Export". This will open the share sheet to send the JSON file/text.
- **Import:** Tap "Import", paste the JSON text into the text box, and confirm.

---

## Security Concepts (High-Level)

### End-to-End Encryption (E2EE)
This app implements a simplified version of E2EE:
1. When you log in via QR code, the Web App generates an encryption key pair.
2. The **Public Key** is sent to the Mobile App via the QR code token.
3. Both devices compute a **Shared Secret** (using their keys) that never leaves the device.
4. Messages are encrypted with AES using this shared secret before being sent over the network. The server relays the encrypted binary data without knowing the content.

### Token Refresh
To keep your session secure without forcing you to log in constantly:
1. **Access Tokens** are short-lived (e.g., 15 minutes). They are used for API requests.
2. **Refresh Tokens** are long-lived (stored securely).
3. When an Access Token expires, the app silently sends the Refresh Token to the server to get a new Access Token.
4. If the Refresh Token is invalid (e.g., you logged out), the user is redirected to the login screen.

---

## AI Tools Used
This project was built with the assistance of **Antigravity**, an advanced AI coding agent.
- AI was used to scaffold the project structure for Next.js and React Native.
- It helped generate boilerplate code for Socket.io connections and complex UI components.
- Debugging assistance was provided for fixing "Empty Message" decryption errors and standardizing the UI designs.
