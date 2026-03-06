# Ray Travel Admin Panel

A modern travel tour management admin panel built with React.

## Tech Stack

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd ray-travel-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Admin Features

- Tour management (CRUD operations)
- Destination management
- Blog post management
- Things to do management
- Media library
- Customer reviews management
- Contact messages
- Booking inquiries
- Email list management
- User profile & settings

## Environment Variables

- **`VITE_API_URL`** - Base API URL (e.g. `http://localhost:5000/api/v1`)

## Deployment

For deployment, ensure `VITE_API_URL` is set correctly and API CORS is configured so login and refresh token work properly.
