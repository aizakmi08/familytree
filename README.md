# AI Family Tree Builder

Create stunning, AI-generated family trees. Add your family members, choose a theme (including premium themes like Game of Thrones, The Simpsons, Harry Potter), and let AI create a beautiful visualization.

## Features

- **Easy Data Entry**: Add family members with names, photos, and relationships
- **AI Generation**: Generate beautiful family tree artwork using DALL-E 3
- **Premium Themes**: Choose from themed designs inspired by popular shows/movies
- **Photo Integration**: Real photos are composited into the AI-generated artwork
- **Export Options**: Download high-quality images of your family tree

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Zustand
- **Backend**: Node.js, Express, MongoDB
- **AI**: OpenAI DALL-E 3
- **Image Processing**: Sharp
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Cloudinary account
- Stripe account (for payments)

### Installation

```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp server/env.sample server/.env
cp client/env.sample client/.env
# Edit .env files with your API keys

# Start development servers
npm run dev
```

### Environment Variables

**Server (.env)**:
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key for DALL-E
- `CLOUDINARY_*` - Cloudinary credentials
- `STRIPE_*` - Stripe credentials

**Client (.env)**:
- `VITE_API_URL` - Backend API URL

## License

MIT
