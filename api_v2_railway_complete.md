# cdigitalstudio Courses Platform — OpenSpec API Documentation

**Version:** 2.0.0  
**Environment:** Production (Railway)  
**Base URL:** `https://api.cdigitalstudio.com/v1`  
**Status:** Active Development  
**Database:** PostgreSQL (Railway)  
**Auth:** JWT with Refresh Tokens

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & JWT](#authentication--jwt)
3. [Rate Limiting](#rate-limiting)
4. [Database Schema](#database-schema)
5. [Endpoints](#endpoints)
   - [Authentication](#authentication-1)
   - [Users](#users)
   - [Courses](#courses)
   - [Enrollment & Payments](#enrollment--payments)
   - [Certificates](#certificates)
   - [Comments & Ratings](#comments--ratings)
   - [Tags](#tags)
   - [Admin Dashboard](#admin-dashboard)
6. [Webhooks](#webhooks)
7. [Error Handling](#error-handling)
8. [Implementation Guide](#implementation-guide)

---

## Overview

**Purpose:** Backend API for cdigitalstudio courses platform running entirely on Railway. Single live session model per course with Google Meet link and Google Drive recording.

**Architecture:**
- Backend: NestJS on Railway
- Database: PostgreSQL on Railway
- Authentication: JWT with Refresh Tokens (no external auth service)
- ORM: Prisma
- Email: Resend Pro
- Storage: Railway volume storage + Supabase Storage (optional backup)
- Payments: Stripe, PayPal

**Key Features:**
- Email/password authentication with JWT
- Automatic access expiration based on duration_days
- Single live session + recorded session per course
- Certificate generation with configurable signature position
- Rate limiting on auth endpoints
- Comprehensive audit logs
- Admin dashboard with analytics

---

## Authentication & JWT

### JWT Token Structure

**Access Token** (short-lived)
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",  // "user" | "admin"
  "iat": 1710502200,
  "exp": 1710505800,
  "type": "access"
}
```

**Refresh Token** (long-lived)
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1710502200,
  "exp": 1718278200,
  "type": "refresh"
}
```

### Token Expiration & Refresh Strategy

| Token Type | Duration | Use Case |
|-----------|----------|----------|
| Access Token | 1 hour (3600 seconds) | API requests |
| Refresh Token | 30 days (2592000 seconds) | Get new access token |
| Session Duration | 30 days | Max session lifetime |

**Token Refresh Flow:**
```
1. User logs in → Gets access_token + refresh_token
2. access_token expires after 1 hour
3. Frontend detects 401 Unauthorized
4. Frontend calls POST /auth/refresh with refresh_token
5. Backend validates refresh_token
6. Backend issues new access_token (same refresh_token)
7. If refresh_token expired → User must login again
```

### JWT Implementation in NestJS

```typescript
// auth.service.ts
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'access'
      },
      { expiresIn: '1h' }  // 1 hour
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh'
      },
      { expiresIn: '30d' }  // 30 days
    );

    // Store refresh token hash in database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: hashedRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,  // seconds
      token_type: 'Bearer'
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.users.findUnique({
        where: { id: decoded.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify refresh token exists and is valid
      const storedToken = await this.prisma.refresh_tokens.findFirst({
        where: {
          user_id: user.id,
          expires_at: { gt: new Date() }
        }
      });

      if (!storedToken || !await bcrypt.compare(refreshToken, storedToken.token_hash)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Issue new access token
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          type: 'access'
        },
        { expiresIn: '1h' }
      );

      return {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600
      };
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}

// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

// jwt.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Usage in controller
@Post('protected-route')
@UseGuards(JwtAuthGuard)
async protectedRoute(@Request() req) {
  return { message: `Hello ${req.user.email}` };
}
```

### Token Storage (Client-Side Best Practices)

```typescript
// In Next.js
// Access token: In-memory or short-lived httpOnly cookie
// Refresh token: httpOnly secure cookie (not accessible from JS)

const setAuthTokens = (accessToken: string, refreshToken: string) => {
  // Access token in memory
  sessionStorage.setItem('access_token', accessToken);
  
  // Refresh token in httpOnly cookie (set by server)
  // Never expose refresh token to JavaScript
};

const getAccessToken = (): string | null => {
  return sessionStorage.getItem('access_token');
};

const clearAuthTokens = () => {
  sessionStorage.removeItem('access_token');
  // Refresh token cleared by server via cookie expiration
};
```

---

## Rate Limiting

### Global Rate Limiting Strategy

Implement Redis-based rate limiting on Railway. Rate limits are applied per IP address and per user.

**Rate Limit Tiers:**

| Endpoint Group | Limit | Window | Error Code |
|---|---|---|---|
| Authentication (/auth/*) | 5 requests | 15 minutes | 429 |
| Public Courses (GET) | 100 requests | 1 minute | 429 |
| User API (authenticated) | 1000 requests | 1 hour | 429 |
| Admin API | 500 requests | 1 hour | 429 |
| Payment Webhooks | Unlimited | N/A | N/A |

### Rate Limiting Implementation (NestJS)

```typescript
// rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 900,  // 15 minutes
        limit: 5   // 5 requests per 15 minutes
      },
      {
        name: 'api',
        ttl: 60,   // 1 minute
        limit: 100 // 100 requests per minute
      },
      {
        name: 'user',
        ttl: 3600, // 1 hour
        limit: 1000 // 1000 requests per hour
      }
    ])
  ]
})
export class AppModule {}

// auth.controller.ts
@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle('auth')  // Apply 'auth' rate limit
export class AuthController {
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Login endpoint limited to 5 requests per 15 minutes
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // Register endpoint limited to 5 requests per 15 minutes
  }
}

// courses.controller.ts
@Controller('courses')
@UseGuards(ThrottlerGuard)
@Throttle('api')  // Apply 'api' rate limit
export class CoursesController {
  @Get()
  async getCourses() {
    // Public courses limited to 100 requests per minute
  }
}

// Authenticated endpoints
@Controller('users')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle('user')  // Apply 'user' rate limit
export class UsersController {
  @Get('me')
  async getProfile(@Request() req) {
    // User endpoints limited to 1000 requests per hour
  }
}
```

### Rate Limit Response Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710505800
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Max 5 requests per 15 minutes.",
    "status": 429,
    "retry_after": 423,
    "timestamp": "2024-03-15T14:20:00Z"
  }
}
```

---

## Database Schema

### PostgreSQL Setup (Railway)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'expired');
```

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  phone VARCHAR(20),
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- Audit log for security
CREATE TABLE user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,  -- 'login', 'logout', 'password_change', 'profile_update'
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50),  -- 'success', 'failed', 'suspicious'
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### User Preferences Table

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  class_reminder BOOLEAN DEFAULT true,
  novelties BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,  -- NULL if not revoked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Clean up expired tokens daily
-- SELECT * FROM refresh_tokens WHERE expires_at < NOW() AND revoked_at IS NULL;
```

### Courses Table

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  instructor_name VARCHAR(255) NOT NULL,
  price_mxn DECIMAL(10, 2) NOT NULL,
  price_usd DECIMAL(10, 2),
  duration_days INTEGER DEFAULT 30,
  thumbnail_url VARCHAR(500),
  images JSONB,  -- Array of image URLs
  course_content JSONB,  -- [{title, description}]
  whats_included JSONB,  -- [{title, description}]
  occupancy INTEGER DEFAULT 50,
  pdf_base_certificate VARCHAR(500),
  pdf_sign_position VARCHAR(50) DEFAULT 'bottom_right',  -- top_left, top_right, bottom_left, bottom_right
  google_meet_link VARCHAR(500) NOT NULL,
  google_drive_recorded_link VARCHAR(500),
  date_of_transmission TIMESTAMP NOT NULL,
  published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_published (published),
  INDEX idx_date_of_transmission (date_of_transmission),
  INDEX idx_created_at (created_at)
);

-- Course soft delete support
CREATE TABLE courses_deleted_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  title VARCHAR(255),
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by UUID REFERENCES users(id),
  reason TEXT
);
```

### Course Enrollments Table

```sql
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255),
  paypal_transaction_id VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  payment_status payment_status DEFAULT 'pending',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  access_until TIMESTAMP NOT NULL,  -- enrolled_at + course.duration_days
  attended_live_session BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_access_until (access_until),
  INDEX idx_created_at (created_at)
);
```

### Certificates Table

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL UNIQUE REFERENCES course_enrollments(id) ON DELETE CASCADE,
  pdf_url VARCHAR(500) NOT NULL,
  certificate_code VARCHAR(50) UNIQUE NOT NULL,  -- CERT-YYYY-0001
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_certificate_code (certificate_code)
);
```

### Course Comments Table

```sql
CREATE TABLE course_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_id (course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
);
```

### Tags Table

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP  -- Soft delete
);

CREATE TABLE course_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, tag_id),
  INDEX idx_course_id (course_id),
  INDEX idx_tag_id (tag_id)
);
```

### Payment Transactions Log

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- 'stripe', 'paypal'
  provider_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3),
  status VARCHAR(50) NOT NULL,  -- 'pending', 'completed', 'failed', 'refunded'
  metadata JSONB,  -- Webhook data
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_provider_transaction_id (provider_transaction_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### Prisma Schema (prisma/schema.prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String   @unique
  fullName      String
  passwordHash  String
  phone         String?
  role          String   @default("user")  // "user" | "admin"
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  preferences         UserPreferences?
  enrollments         CourseEnrollment[]
  comments            CourseComment[]
  certificates        Certificate[]
  refreshTokens       RefreshToken[]
  auditLogs           UserAuditLog[]
  paymentTransactions PaymentTransaction[]

  @@index([email])
  @@index([createdAt])
}

model UserPreferences {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId              String   @unique @db.Uuid
  classReminder       Boolean  @default(true)
  novelties           Boolean  @default(true)
  emailNotifications  Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  tokenHash String   @unique
  ipAddress String?
  userAgent String?
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Course {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title                   String
  subtitle                String?
  description             String?
  instructorName          String
  priceMxn                Decimal  @db.Decimal(10, 2)
  priceUsd                Decimal? @db.Decimal(10, 2)
  durationDays            Int      @default(30)
  thumbnailUrl            String?
  images                  Json?
  courseContent           Json?
  whatsIncluded           Json?
  occupancy               Int      @default(50)
  pdfBaseCertificate      String?
  pdfSignPosition         String   @default("bottom_right")
  googleMeetLink          String
  googleDriveRecordedLink String?
  dateOfTransmission      DateTime
  published               Boolean  @default(false)
  isActive                Boolean  @default(true)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  enrollments CourseEnrollment[]
  comments    CourseComment[]
  tags        CourseTag[]
  certificates Certificate[]

  @@index([published])
  @@index([dateOfTransmission])
  @@index([createdAt])
}

model CourseEnrollment {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId              String   @db.Uuid
  courseId            String   @db.Uuid
  stripePaymentId     String?
  paypalTransactionId String?
  amountPaid          Decimal  @db.Decimal(10, 2)
  currency            String   @default("MXN")
  paymentStatus       String   @default("pending")
  enrolledAt          DateTime @default(now())
  completedAt         DateTime?
  accessUntil         DateTime
  attendedLiveSession Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user        User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  course      Course                @relation(fields: [courseId], references: [id], onDelete: Cascade)
  certificate Certificate?
  transaction PaymentTransaction?

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([paymentStatus])
  @@index([accessUntil])
  @@index([createdAt])
}

model Certificate {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @db.Uuid
  courseId        String   @db.Uuid
  enrollmentId    String   @unique @db.Uuid
  pdfUrl          String
  certificateCode String   @unique
  issuedAt        DateTime @default(now())
  createdAt       DateTime @default(now())

  user       User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  course     Course              @relation(fields: [courseId], references: [id], onDelete: Cascade)
  enrollment CourseEnrollment    @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([courseId])
  @@index([certificateCode])
}

model CourseComment {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId            String   @db.Uuid
  userId              String   @db.Uuid
  userName            String
  comment             String
  rating              Int?
  isVerifiedPurchase  Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([courseId])
  @@index([userId])
  @@index([rating])
  @@index([createdAt])
}

model Tag {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String   @unique
  slug      String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  courses CourseTag[]

  @@index([deletedAt])
}

model CourseTag {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId  String   @db.Uuid
  tagId     String   @db.Uuid
  createdAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([courseId, tagId])
  @@index([courseId])
  @@index([tagId])
}

model PaymentTransaction {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  enrollmentId          String   @db.Uuid
  userId                String   @db.Uuid
  courseId              String   @db.Uuid
  provider              String   // "stripe" | "paypal"
  providerTransactionId String   @unique
  amount                Decimal  @db.Decimal(10, 2)
  currency              String?
  status                String   // "pending" | "completed" | "failed" | "refunded"
  metadata              Json?
  errorMessage          String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  enrollment CourseEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  course     Course           @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@index([providerTransactionId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model UserAuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  action    String   // "login" | "logout" | "password_change" | "profile_update"
  ipAddress String?
  userAgent String?
  status    String   // "success" | "failed" | "suspicious"
  details   Json?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

---

## Endpoints

### Authentication

#### POST `/auth/register`

Register new user with email/password.

**Authentication:** None (public)  
**Rate Limit:** 5 requests per 15 minutes (auth tier)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "phone": "+52 612 123 4567"
}
```

**Validation Rules:**
- Email: valid email format, unique
- Password: min 8 chars, uppercase, lowercase, number, special char
- Full name: 2-255 characters
- Phone: optional, international format

**Response (201 Created):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2024-03-15T10:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses:**
- `400 Bad Request` - Invalid password or weak security
- `409 Conflict` - Email already registered
- `429 Too Many Requests` - Rate limit exceeded

---

#### POST `/auth/login`

Authenticate user with email/password.

**Authentication:** None (public)  
**Rate Limit:** 5 requests per 15 minutes (auth tier)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Audit Log:** Logs successful/failed login with IP address and user agent

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Rate limit exceeded (after 5 failed attempts)

---

#### POST `/auth/refresh`

Get new access token using refresh token.

**Authentication:** None (uses refresh token from cookie)  
**Rate Limit:** 100 requests per minute

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token
- `403 Forbidden` - Refresh token revoked

---

#### POST `/auth/logout`

Revoke refresh token and end session.

**Authentication:** Required (JWT access token)  
**Rate Limit:** 100 requests per minute

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Actions:**
- Marks refresh token as revoked in database
- Clears httpOnly cookie on client
- Logs logout action to audit trail

---

### Users

#### GET `/users/me`

Get authenticated user profile.

**Authentication:** Required (JWT)  
**Rate Limit:** 1000 requests per hour (user tier)

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+52 612 123 4567",
  "role": "user",
  "preferences": {
    "class_reminder": true,
    "novelties": true,
    "email_notifications": true
  },
  "courses_bought": 3,
  "courses_completed": 1,
  "courses_pending": 2,
  "last_login_at": "2024-03-15T14:20:00Z",
  "created_at": "2024-03-15T10:30:00Z",
  "updated_at": "2024-03-15T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User not found

---

#### GET `/users/me/courses`

Get user's enrolled courses.

**Authentication:** Required (JWT)  
**Rate Limit:** 1000 requests per hour (user tier)

**Query Parameters:**
- `status` (optional): `active` | `completed` | `expired`
- `page` (optional, default 1): Pagination
- `limit` (optional, default 10): Results per page

**Response (200 OK):**
```json
{
  "courses": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Charcutería Básica",
      "instructor_name": "Chef María",
      "status": "active",
      "thumbnail_url": "https://...",
      "enrolled_at": "2024-03-15T10:30:00Z",
      "access_until": "2024-04-15T10:30:00Z",
      "date_of_transmission": "2024-03-20T18:00:00Z",
      "attended_live_session": false,
      "has_certificate": false
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_count": 3
  }
}
```

---

#### GET `/users/me/certificates`

Get user's issued certificates.

**Authentication:** Required (JWT)  
**Rate Limit:** 1000 requests per hour (user tier)

**Response (200 OK):**
```json
{
  "certificates": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "course_id": "660e8400-e29b-41d4-a716-446655440000",
      "course_title": "Charcutería Básica",
      "certificate_code": "CERT-2024-0001",
      "pdf_url": "https://storage.example.com/certificates/cert-001.pdf",
      "issued_at": "2024-03-30T14:45:00Z"
    }
  ],
  "total": 1
}
```

---

#### PUT `/users/me`

Update user profile and preferences.

**Authentication:** Required (JWT)  
**Rate Limit:** 1000 requests per hour (user tier)

**Request Body:**
```json
{
  "full_name": "John Updated",
  "phone": "+52 612 987 6543",
  "preferences": {
    "class_reminder": false,
    "novelties": true,
    "email_notifications": true
  }
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "full_name": "John Updated",
  "phone": "+52 612 987 6543",
  "preferences": {
    "class_reminder": false,
    "novelties": true,
    "email_notifications": true
  },
  "updated_at": "2024-03-15T15:45:00Z"
}
```

---

#### POST `/users/me/change-password`

Change password (requires old password).

**Authentication:** Required (JWT)  
**Rate Limit:** 10 requests per hour (auth tier)

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully",
  "must_login_again": true
}
```

**Actions:**
- Validates current password
- Hashes new password with bcrypt
- Revokes all existing refresh tokens (forces re-login)
- Logs password change to audit trail

---

### Courses

#### GET `/courses`

List all published courses (public endpoint).

**Authentication:** None  
**Rate Limit:** 100 requests per minute (api tier)

**Query Parameters:**
- `page` (optional, default 1): Pagination
- `limit` (optional, default 10): Results per page
- `tags` (optional): Comma-separated tag IDs
- `search` (optional): Search title and description
- `sort` (optional): `newest` | `oldest` | `price_asc` | `price_desc`

**Response (200 OK):**
```json
{
  "courses": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Charcutería Básica",
      "subtitle": "Aprende técnicas fundamentales",
      "instructor_name": "Chef María",
      "price_mxn": 1500.00,
      "price_usd": 89.99,
      "duration_days": 30,
      "thumbnail_url": "https://...",
      "occupancy": 20,
      "date_of_transmission": "2024-03-20T18:00:00Z",
      "tags": ["Beginner", "Charcuterie"],
      "average_rating": 4.8,
      "total_comments": 5
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 48
  }
}
```

---

#### GET `/courses/:id`

Get course details (public endpoint).

**Authentication:** None  
**Rate Limit:** 100 requests per minute (api tier)

**Path Parameters:**
- `id`: Course UUID

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Charcutería Básica",
  "subtitle": "Aprende técnicas fundamentales",
  "description": "Descripción completa...",
  "instructor_name": "Chef María",
  "price_mxn": 1500.00,
  "price_usd": 89.99,
  "duration_days": 30,
  "thumbnail_url": "https://...",
  "images": ["https://...", "https://..."],
  "course_content": [
    {
      "title": "Introducción",
      "description": "Presentación del taller"
    }
  ],
  "whats_included": [
    {
      "title": "Certificado digital",
      "description": "Descarga tu certificado"
    }
  ],
  "occupancy": 20,
  "google_meet_link": "https://meet.google.com/abc-defg-hij",
  "date_of_transmission": "2024-03-20T18:00:00Z",
  "tags": ["Beginner", "Charcuterie"],
  "comments": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "user_name": "María García",
      "comment": "Excelente curso",
      "rating": 5,
      "created_at": "2024-03-25T12:30:00Z"
    }
  ],
  "average_rating": 4.8,
  "total_comments": 3,
  "created_at": "2024-03-01T09:00:00Z"
}
```

---

#### POST `/courses`

Create new course (admin only).

**Authentication:** Required (JWT with admin role)  
**Rate Limit:** 500 requests per hour (admin tier)

**Request Body:**
```json
{
  "title": "Charcutería Avanzada",
  "subtitle": "Técnicas profesionales",
  "description": "Curso avanzado...",
  "instructor_name": "Chef Juan",
  "price_mxn": 2500.00,
  "price_usd": 149.99,
  "duration_days": 45,
  "thumbnail_url": "https://...",
  "images": ["https://...", "https://..."],
  "course_content": [
    { "title": "Módulo 1", "description": "Intro" }
  ],
  "whats_included": [
    { "title": "Certificado", "description": "Certificado profesional" }
  ],
  "occupancy": 15,
  "pdf_base_certificate": "https://...",
  "pdf_sign_position": "bottom_right",
  "google_meet_link": "https://meet.google.com/xxx-xxx-xxx",
  "google_drive_recorded_link": "https://drive.google.com/...",
  "date_of_transmission": "2024-04-15T19:00:00Z",
  "tag_ids": ["tag-id-1", "tag-id-2"],
  "published": false
}
```

**Response (201 Created):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "title": "Charcutería Avanzada",
  "...": "...",
  "created_at": "2024-03-15T14:20:00Z"
}
```

---

#### PUT `/courses/:id`

Update course (admin only).

**Authentication:** Required (JWT with admin role)  
**Rate Limit:** 500 requests per hour (admin tier)

**Path Parameters:**
- `id`: Course UUID

**Request Body:** (All fields optional)

**Response (200 OK):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "title": "Charcutería Avanzada (Updated)",
  "updated_at": "2024-03-15T15:45:00Z"
}
```

---

### Enrollment & Payments

#### POST `/enrollments/checkout`

Initiate Stripe payment.

**Authentication:** Required (JWT)  
**Rate Limit:** 100 requests per minute (api tier)

**Request Body:**
```json
{
  "course_id": "660e8400-e29b-41d4-a716-446655440000",
  "currency": "MXN"
}
```

**Response (200 OK):**
```json
{
  "checkout_session_id": "cs_test_123abc...",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_123abc...",
  "expires_at": "2024-03-15T16:20:00Z"
}
```

---

#### POST `/webhooks/stripe`

Stripe webhook handler (internal).

**Authentication:** None (uses webhook signature)  
**Rate Limit:** None (payment webhooks)

**Request Body:**
```json
{
  "id": "evt_123abc...",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123abc...",
      "amount": 150000,
      "currency": "mxn",
      "metadata": {
        "course_id": "660e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440000"
      }
    }
  }
}
```

**Webhook Actions:**
1. Verify signature with `STRIPE_WEBHOOK_SECRET`
2. Create enrollment record
3. Calculate `access_until` = now + course.duration_days
4. Log transaction
5. Send confirmation email
6. Queue certificate generation

---

### Certificates

#### POST `/certificates/generate`

Generate certificate (internal webhook trigger).

**Authentication:** Internal only

**Request Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "660e8400-e29b-41d4-a716-446655440000",
  "enrollment_id": "aa0e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440000",
  "certificate_code": "CERT-2024-001",
  "pdf_url": "https://storage.example.com/certificates/cert-2024-001.pdf",
  "issued_at": "2024-03-30T14:45:00Z"
}
```

---

#### GET `/certificates/:id`

Download certificate PDF.

**Authentication:** Optional (owner verification)

**Path Parameters:**
- `id`: Certificate UUID

**Response (200 OK - PDF)**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="cert-2024-001.pdf"

[PDF binary data]
```

---

### Comments & Ratings

#### POST `/courses/:id/comments`

Add comment to course (must be enrolled).

**Authentication:** Required (JWT)  
**Rate Limit:** 100 requests per minute (api tier)

**Path Parameters:**
- `id`: Course UUID

**Request Body:**
```json
{
  "comment": "Excelente curso, muy completo",
  "rating": 5
}
```

**Response (201 Created):**
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440000",
  "user_name": "John Doe",
  "comment": "Excelente curso, muy completo",
  "rating": 5,
  "is_verified_purchase": true,
  "created_at": "2024-03-30T16:20:00Z"
}
```

---

#### GET `/courses/:id/comments`

Get course comments (public).

**Authentication:** None  
**Rate Limit:** 100 requests per minute (api tier)

**Path Parameters:**
- `id`: Course UUID

**Query Parameters:**
- `page` (optional): Pagination
- `sort` (optional): `recent` | `helpful` | `rating_high` | `rating_low`

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440000",
      "user_name": "John Doe",
      "comment": "Excelente curso...",
      "rating": 5,
      "is_verified_purchase": true,
      "created_at": "2024-03-30T16:20:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_count": 12
  },
  "average_rating": 4.7
}
```

---

### Tags

#### GET `/tags`

List all active tags (public).

**Authentication:** None  
**Rate Limit:** 100 requests per minute (api tier)

**Query Parameters:**
- `search` (optional): Filter by title

**Response (200 OK):**
```json
{
  "tags": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440000",
      "title": "Beginner",
      "slug": "beginner"
    }
  ]
}
```

---

#### POST `/tags`

Create tag (admin only).

**Authentication:** Required (JWT with admin role)  
**Rate Limit:** 500 requests per hour (admin tier)

**Request Body:**
```json
{
  "title": "Intermediate"
}
```

**Response (201 Created):**
```json
{
  "id": "ff0e8400-e29b-41d4-a716-446655440000",
  "title": "Intermediate",
  "slug": "intermediate",
  "created_at": "2024-03-15T14:00:00Z"
}
```

---

### Admin Dashboard

#### GET `/admin/enrollments`

List all enrollments (admin only).

**Authentication:** Required (JWT with admin role)  
**Rate Limit:** 500 requests per hour (admin tier)

**Query Parameters:**
- `page`: Pagination
- `status`: Filter by status
- `course_id`: Filter by course

**Response (200 OK):**
```json
{
  "enrollments": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "full_name": "John Doe"
      },
      "course": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "title": "Charcutería Básica"
      },
      "amount_paid": 1500.00,
      "currency": "MXN",
      "payment_status": "completed",
      "enrolled_at": "2024-03-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 28
  }
}
```

---

#### GET `/admin/users`

List all users (admin only).

**Authentication:** Required (JWT with admin role)  
**Rate Limit:** 500 requests per hour (admin tier)

**Query Parameters:**
- `page`: Pagination
- `search`: Search by email/name

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "courses_bought": 3,
      "courses_completed": 1,
      "last_login_at": "2024-03-15T14:20:00Z",
      "created_at": "2024-03-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_count": 48
  }
}
```

---

#### GET `/admin/analytics`

Dashboard analytics (admin only).

**Authentication:** Required (JWT with admin role)  
**Rate Limit:** 500 requests per hour (admin tier)

**Response (200 OK):**
```json
{
  "overview": {
    "total_users": 48,
    "total_revenue_mxn": 125000.00,
    "total_revenue_usd": 7425.50,
    "total_enrollments": 156,
    "courses_published": 12
  },
  "recent_enrollments": [
    {
      "user_name": "John Doe",
      "course_title": "Charcutería Básica",
      "amount": 1500.00,
      "enrolled_at": "2024-03-15T10:30:00Z"
    }
  ],
  "monthly_revenue": [
    {
      "month": "2024-01",
      "revenue_mxn": 45000.00
    }
  ],
  "top_courses": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Charcutería Básica",
      "enrollments": 45,
      "revenue_mxn": 67500.00
    }
  ]
}
```

---

## Webhooks

### Stripe Webhooks

**Endpoint:** `POST /webhooks/stripe`  
**Signature Header:** `stripe-signature`

**Verification:**
```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Events Handled:**
- `payment_intent.succeeded` - Successful payment
- `charge.refunded` - Refund processed
- `charge.dispute.created` - Chargeback filed

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Course not found",
    "status": 404,
    "timestamp": "2024-03-15T14:20:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_REQUEST` | 400 | Bad request |
| `VALIDATION_ERROR` | 400 | Field validation failed |
| `UNAUTHORIZED` | 401 | Invalid/missing JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Implementation Guide

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@rail.app:5432/railway

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRATION=3600  # 1 hour in seconds
JWT_REFRESH_EXPIRATION=2592000  # 30 days in seconds

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PayPal
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx

# Email
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@cdigitalstudio.com

# Application
NODE_ENV=production
API_PORT=3000
API_URL=https://api.cdigitalstudio.com
FRONTEND_URL=https://cdigitalstudio.com
```

### Prisma Commands

```bash
# Initial setup
npm install @prisma/client prisma -D

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Deploy migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Database Maintenance

```bash
# Clean up expired refresh tokens (run daily via cron)
DELETE FROM refresh_tokens 
WHERE expires_at < NOW() AND revoked_at IS NULL;

# Archive old audit logs (run monthly)
INSERT INTO audit_logs_archive 
SELECT * FROM user_audit_log 
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM user_audit_log 
WHERE created_at < NOW() - INTERVAL '90 days';

# Analyze table for performance
ANALYZE users, courses, course_enrollments;
```

### NestJS Module Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'auth', ttl: 900, limit: 5 },
      { name: 'api', ttl: 60, limit: 100 },
      { name: 'user', ttl: 3600, limit: 1000 },
      { name: 'admin', ttl: 3600, limit: 500 }
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }
    }),
    PrismaModule,
    AuthModule,
    CoursesModule
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
```

---

## Security Best Practices Implemented

✅ **Password Security**
- Bcrypt hashing (10 rounds minimum)
- Password validation (min 8 chars, mixed case, numbers, special chars)
- Password change revokes all sessions

✅ **JWT Security**
- Separate access and refresh tokens
- Short access token lifetime (1 hour)
- Refresh token stored with hash in database
- Token revocation support
- Timestamp validation

✅ **Rate Limiting**
- Different limits per endpoint group
- IP-based and user-based limiting
- Retry-After headers
- Progressive delays after failures

✅ **Database Security**
- Soft deletes for data recovery
- Audit logging for sensitive actions
- Connection pooling via Railway
- SSL/TLS transport layer
- SQL injection prevention via Prisma ORM

✅ **Audit Trail**
- Login/logout logging
- Password change logging
- Admin actions logging
- IP address and user agent tracking

---

**Version:** 2.0.0  
**Last Updated:** March 15, 2024  
**Maintained By:** cdigitalstudio Development Team
