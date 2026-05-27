# Hello Greeter

A modern HotPocket (Evernode) React frontend for the uploaded HelloWorld contract. It reads and updates a persisted greeting via the Hello service.

Backend Compatibility
- Service: `Hello`
  - Actions:
    - `GetMessage` (READ)
    - `SetMessage` (WRITE, data.message required)
- Message format: JSON with `{ Service, Action, data? }`

Features
- HotPocket client via CDN, JSON protocol for exact compatibility
- Mock mode to develop UI without servers
- Tailwind CSS UI with responsive design
- Redux Toolkit + React Router v7
- Snackbar notifications and robust error handling
- Developer Console to invoke any `{Service, Action, data}`

Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   - For development without servers (default):
     ```env
     VITE_MOCK_MODE=true
     VITE_CONTRACT_URLS=wss://localhost:8081
     VITE_HP_PROTOCOL=json
     ```
   - For real servers:
     ```env
     VITE_MOCK_MODE=false
     VITE_CONTRACT_URLS=wss://your-hotpocket-1.example,wss://your-hotpocket-2.example
     VITE_HP_PROTOCOL=json
     ```
3. Run the app:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build && npm run preview
   ```

Project Structure
- `src/services/contract-service.ts`: HotPocket client singleton with mock mode
- `src/services/api-service.ts`: API methods for Hello service
- `src/Components/Hello/HelloDashboard.tsx`: UI to read/update the greeting
- `src/Components/Developer/ContractInvoker.tsx`: Generic invoker
- `src/features/*`: Redux slices (auth, snackbar)
- `src/routes/routes.tsx`: Route definitions

Testing (basic smoke test)
- A simple Node-based smoke script verifies environment setup.
  ```bash
  npm run test
  ```

Troubleshooting
- Error: "HotPocket browser client not found" → Ensure CDN scripts in index.html load and network allows them.
- Error: "Please configure VITE_CONTRACT_URLS..." → Set real wss URLs or enable mock mode.
- Error: "Ledger rejection" → The network rejected a write; check server health and consensus.

License
- MIT
