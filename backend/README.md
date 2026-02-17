# Backend API

Backend server built with Express, TypeScript, MongoDB (Mongoose), and Better Auth for authentication.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: Better Auth
- **Authorization**: Role-Based Access Control (RBAC)
- **Validation**: Zod
- **Language**: TypeScript

## Setup

### Prerequisites

- Bun installed ([https://bun.sh](https://bun.sh))
- MongoDB running locally or connection string to remote instance

### Installation

1. Install dependencies:

```bash
bun install
```

2. Create `.env` file from the example:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:

```env
MONGODB_URI=your_mongodb_uri
PORT=3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=http://localhost:5173
```

> **Important**: Change `BETTER_AUTH_SECRET` to a secure random string (at least 32 characters) in production.

### Cloudinary Setup (for Image Uploads)

1. Create a free account at [Cloudinary](https://cloudinary.com)
2. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note**: Image uploads will be disabled if Cloudinary credentials are not configured.

## Running

### Development mode (with hot reload):

```bash
bun run dev
```

### Production build:

```bash
bun run build
bun run start
```

## Project Structure

```
src/
├── config/
│   ├── db.ts           # MongoDB & Mongoose connection setup
│   ├── auth.ts         # Better Auth configuration
│   └── cloudinary.ts   # Cloudinary image upload configuration
├── controllers/
│   ├── auth.controller.ts   # Auth-related business logic
│   └── user.controller.ts   # User CRUD operations
├── middleware/
│   ├── auth.ts              # Authentication & authorization middleware
│   ├── errorHandler.ts      # Error handling middleware
│   └── validation.ts        # Zod validation middleware
├── models/
│   └── User.ts              # Mongoose User model
├── routes/
│   ├── index.ts             # Main router aggregator
│   ├── profile.routes.ts    # Profile/auth routes
│   ├── user.routes.ts       # User management routes
│   └── upload.routes.ts     # Image upload routes
├── schemas/
│   ├── index.ts             # Schema exports
│   ├── auth.schema.ts       # Auth validation schemas
│   ├── user.schema.ts       # User validation schemas
│   └── common.schema.ts     # Reusable schemas
├── utils/
│   └── roles.ts             # Role hierarchy & permission utilities
├── types.d.ts               # TypeScript type definitions
└── index.ts                 # Main server entry point
```

## Database

The project uses **both** MongoDB native driver and Mongoose:

- **Native MongoDB Driver**: Used by Better Auth for authentication tables
- **Mongoose**: Used for application-specific models and schemas

Both share the same MongoDB connection string and database.

## Authentication & Authorization

### Authentication (Better Auth)

Better Auth is configured with:

- Email/password authentication
- Bcrypt password hashing
- MongoDB adapter for session storage
- Transaction support enabled
- Base URL configuration for OAuth callbacks

### Authorization (RBAC)

Three-tier role-based access control:

- **User** (Level 1) - Basic user with standard access permissions
- **Superuser** (Level 2) - Enhanced user with elevated access and management capabilities  
- **Admin** (Level 3) - Full system administrator with complete access and control

**Role Hierarchy**: Admin > Superuser > User (higher roles inherit lower role permissions)

See **[ROLES.md](./ROLES.md)** for detailed RBAC documentation.

### Auth Endpoints

Better Auth automatically provides endpoints at `/api/auth/*`:

- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- And more...

## API Routes

### Better Auth (Auto-generated)
- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- And more... (see [Better Auth docs](https://better-auth.com))

### Profile Routes (`/api/profile`)
- `GET /api/profile/session` - Get session info (Protected)
- `GET /api/profile/verify-email` - Check email verification (Protected)
- `POST /api/profile/sync` - Sync auth user with Mongoose (Protected)
- `GET /api/profile/stats` - Get user stats (Protected)
- `POST /api/profile/create` - Create user profile (Public)

### User Routes (`/api/users`)
- `GET /api/users/me` - Get current user profile (Protected)
- `PUT /api/users/me` - Update current user (Protected)
- `GET /api/users/search?q=query` - Search users (Protected)
- `GET /api/users` - Get all users, paginated (Admin only)
- `GET /api/users/:id` - Get user by ID (Protected)
- `PUT /api/users/:id` - Update user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /` - Root health check
- `GET /api/health` - API health status

See **[API_ROUTES.md](./API_ROUTES.md)** for detailed documentation with request/response examples.

## Validation with Zod

This project uses **Zod** for runtime type validation and schema validation. All request data (body, query, params) is validated using Zod schemas before reaching controllers.

### Using Validation

```typescript
import { validateBody, validateQuery } from "../middleware/validation";
import { updateUserSchema, paginationSchema } from "../schemas";

router.put("/users/:id", validateBody(updateUserSchema), controller.updateUser);
router.get("/users", validateQuery(paginationSchema), controller.getUsers);
```

### Creating Schemas

```typescript
import { z } from "zod";

export const mySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().positive(),
});

// Export inferred type
export type MyInput = z.infer<typeof mySchema>;
```

See **[VALIDATION.md](./VALIDATION.md)** for comprehensive Zod validation guide.

## Creating Mongoose Models

Example model structure (see `src/models/User.ts`):

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IYourModel extends Document {
  field: string;
  createdAt: Date;
  updatedAt: Date;
}

const YourSchema = new Schema<IYourModel>(
  {
    field: { type: String, required: true },
  },
  { timestamps: true }
);

export const YourModel = mongoose.model<IYourModel>("YourModel", YourSchema);
```

## Controllers & Routes

### Creating Controllers

Controllers handle business logic and are located in `src/controllers/`:

```typescript
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export async function yourController(req: AuthRequest, res: Response) {
  try {
    // Your business logic here
    const data = await YourModel.find();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    throw new AppError("Failed to fetch data", 500);
  }
}
```

### Creating Routes

Routes connect URLs to controllers in `src/routes/`:

```typescript
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as yourController from "../controllers/your.controller";

const router = Router();

router.get("/", requireAuth, asyncHandler(yourController.yourController));

export default router;
```

Then register in `src/routes/index.ts`:

```typescript
import yourRoutes from "./your.routes";
router.use("/your-path", yourRoutes);
```

## Middleware

### Authentication & Authorization Middleware

**Authentication:**
- `requireAuth` - Protects routes, requires valid session
- `optionalAuth` - Attaches user if authenticated, but doesn't block

**Authorization (Exact Match):**
- `requireRole(...roles)` - Checks for specific role(s)

**Authorization (Hierarchical):**
- `requireMinRole(role)` - Requires minimum role level (includes higher roles)
- `requireUser` - Requires at least "user" role (everyone)
- `requireSuperuser` - Requires at least "superuser" role (superuser + admin)
- `requireAdmin` - Requires "admin" role only

**Usage:**
```typescript
// Exact role match
router.get("/admin-only", requireAuth, requireRole("admin"), handler);

// Hierarchical (superuser and admin allowed)
router.get("/users", requireAuth, requireSuperuser, handler);

// Convenience shortcuts
router.delete("/users/:id", requireAuth, requireAdmin, handler);
```

### Error Handling

- `asyncHandler` - Wraps async route handlers to catch errors
- `AppError` - Custom error class with status codes
- `errorHandler` - Global error handler middleware

**Usage:**
```typescript
throw new AppError("Custom error message", 400);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | (required) |
| `PORT` | Server port | `3000` |
| `BETTER_AUTH_URL` | Base URL for Better Auth (for OAuth callbacks) | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth (min 32 chars) | - |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

## Notes

- Better Auth handler is mounted **before** `express.json()` middleware (required)
- Graceful shutdown handlers are implemented for both MongoDB connections
- TypeScript types and interfaces should be placed in `src/types.d.ts`
- All routes use `asyncHandler` wrapper to properly catch async errors
- Input validation is handled by Zod schemas with automatic type inference
- Input sanitization is applied automatically via `sanitizeBody` middleware
- Authentication is handled via Better Auth sessions, not JWT tokens
- Role-based permissions use hierarchical system (higher roles inherit lower permissions)
- User roles: `user` < `superuser` < `admin` (in ascending order of permissions)
