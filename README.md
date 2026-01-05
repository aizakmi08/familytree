# Family Tree Builder

A beautiful, modern family tree builder with customizable themes and premium features. Create stunning family trees with ease, add photos, choose from multiple themes, and export your tree to share with family.

## Features

- 🎨 **Multiple Themes**: Choose from 4 free themes and 4 premium themes inspired by popular shows and movies
- 👥 **Easy Family Management**: Simply add names, photos, and relationships
- 📸 **Photo Uploads**: Upload and store family photos with Cloudinary integration
- 💾 **Hybrid Storage**: Use local storage as a guest or sync to the cloud with an account
- 💳 **Premium Features**: Unlock premium themes and export options with Stripe payments
- 📄 **Export Options**: Export as PNG (free, watermarked) or PDF (premium, unwatermarked)
- 🎯 **Intuitive UX**: Beautiful, modern interface that feels hand-crafted

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Flow** - Tree visualization
- **React Router** - Routing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Stripe** - Payments
- **Cloudinary** - Image storage

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aizakmi08/familytree.git
cd FamilyTree
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

Create `server/.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/familytree
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Development

Start both client and server:
```bash
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Client
npm run dev:client

# Terminal 2 - Server
npm run dev:server
```

- Client: http://localhost:5173
- Server: http://localhost:3000

### Building for Production

```bash
cd client
npm run build
```

The production build will be in `client/dist/`.

## Project Structure

```
FamilyTree/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   ├── themes/      # Theme definitions
│   │   └── utils/       # Utility functions
│   └── package.json
├── server/              # Express backend
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── server.js        # Entry point
└── package.json         # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Family Trees
- `GET /api/trees` - Get all trees (authenticated)
- `GET /api/trees/:id` - Get single tree
- `POST /api/trees` - Create/update tree (authenticated)
- `DELETE /api/trees/:id` - Delete tree (authenticated)

### Upload
- `POST /api/upload/image` - Upload image (authenticated)
- `DELETE /api/upload/image/:publicId` - Delete image (authenticated)

### Payments
- `POST /api/payments/checkout/theme` - Create theme checkout session
- `POST /api/payments/checkout/export` - Create export checkout session
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/purchases` - Get user purchases

## Features in Detail

### Themes

**Free Themes:**
- Classic - Clean, minimal, professional
- Cozy - Warm browns, paper texture
- Modern - Sharp lines, monochrome
- Nature - Soft greens, organic shapes

**Premium Themes ($4.99 each):**
- Game of Thrones - Medieval parchment style
- The Simpsons - Cartoon yellow theme
- Harry Potter - Magical parchment
- Peaky Blinders - Dark moody vintage

### Export Options

- **Free PNG**: Watermarked export for free users
- **Premium PDF**: Unwatermarked, print-ready PDF ($2.99)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
