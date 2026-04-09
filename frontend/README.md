# RAT G700 - Build Management Tool

A legitimate build and configuration management application built on the Internet Computer.

## What is RAT G700?

RAT G700 is a build management tool designed to help you organize and track configurations, parts lists, and project documentation. The application provides:

- **Build Management**: Create and organize multiple builds with descriptions
- **Item Tracking**: Add items with quantities, costs, and notes
- **Cost Calculation**: Automatic total cost calculations
- **Import/Export**: Back up and share builds via JSON files
- **Secure Storage**: All data is stored privately under your authenticated identity

**Important**: This is NOT a remote access tool. RAT G700 does not provide device control, remote access, credential capture, or any malware functionality.

## Development Setup

### Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager

### Local Development

1. **Start the local Internet Computer replica:**
   ```bash
   dfx start --clean --background
   ```

2. **Deploy the canisters:**
   ```bash
   cd frontend
   pnpm run setup
   ```

3. **Start the development server:**
   ```bash
   pnpm start
   ```

4. **Access the application:**
   Open your browser to `http://localhost:3000`

### Building for Production

