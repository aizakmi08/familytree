# Family Tree Builder

A beautiful, modern family tree builder with customizable themes and premium features.

## Features

- 🎨 Multiple themes (free and premium)
- 👥 Easy family member management
- 📸 Photo uploads
- 💾 Local storage and cloud sync
- 💳 Premium themes and exports
- 📄 PDF export functionality

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **Payments**: Stripe
- **Images**: Cloudinary

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Cloudinary account (for image uploads)
- Stripe account (for payments)

### Installation

```bash
npm run install:all
```

### Development

```bash
npm run dev
```

This will start both the client (port 5173) and server (port 3000).

### Environment Variables

Create `.env` files in both `client/` and `server/` directories with the required variables.

## Project Structure

```
FamilyTree/
├── client/          # React frontend
├── server/          # Express backend
└── package.json     # Root package.json
```

## License

MIT
