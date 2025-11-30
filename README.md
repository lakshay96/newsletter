# Newsletter Service 

A robust, automated newsletter service that sends topic-based content to subscribers at scheduled intervals. Built with Node.js, TypeScript, Express, PostgreSQL, and Prisma.

## Features

- **Topic Management**: Create and manage multiple newsletter topics
- **Subscriber Management**: Add subscribers and manage their topic subscriptions
- **Content Scheduling**: Schedule newsletter content to be sent at specific times
- **Automated Delivery**: Cron-based scheduler automatically sends emails at scheduled times
- **Email Tracking**: Track sent emails with success/failure logs
- **RESTful API**: Complete API for all operations
- **Type Safety**: Built with TypeScript for robust code
- **Database**: PostgreSQL with Prisma ORM

## Architecture & Design Decisions

### Tech Stack Rationale

1. **Node.js + Express**: 
   - Excellent for I/O-bound operations (email sending)
   - Large ecosystem and community support
   - Easy deployment

2. **TypeScript**: 
   - Type safety reduces runtime errors
   - Better IDE support and code completion
   - Easier refactoring and maintenance

3. **PostgreSQL + Prisma**:
   - Relational data fits newsletter domain well
   - Prisma provides type-safe database access
   - Easy migrations and schema management

4. **node-cron**:
   - Simple, reliable scheduling
   - Runs in-process (no external dependencies)
   - Good for moderate-scale applications

5. **Nodemailer**:
   - Industry standard for Node.js email
   - Supports all major SMTP providers
   - Well-documented and maintained

##  Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- SMTP email account (Gmail, SendGrid, etc.)

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/newsletter-service.git
cd newsletter-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb newsletter_db
```

**Option B: Free Cloud PostgreSQL (Recommended)**

Use [Supabase](https://supabase.com/) or [ElephantSQL](https://www.elephantsql.com/) for free PostgreSQL hosting.

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/newsletter_db?schema=public"

# Server
PORT=3000
NODE_ENV=development

# SMTP Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sender Info
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Newsletter Service

# Timezone
TZ=UTC
```

####  Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password
3. Use this app password in `SMTP_PASS`

#### Alternative SMTP Providers

- **SendGrid**: smtp.sendgrid.net (Port 587)
- **Mailgun**: smtp.mailgun.org (Port 587)
- **Amazon SES**: email-smtp.region.amazonaws.com (Port 587)

### 5. Database Migration

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 6. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

##  API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/content/stats` | Get statistics |
| **Topics** |
| POST | `/api/topics` | Create topic |
| GET | `/api/topics` | Get all topics |
| GET | `/api/topics/:id` | Get topic by ID |
| PUT | `/api/topics/:id` | Update topic |
| DELETE | `/api/topics/:id` | Delete topic |
| **Subscribers** |
| POST | `/api/subscribers` | Create subscriber |
| GET | `/api/subscribers` | Get all subscribers |
| GET | `/api/subscribers/:id` | Get subscriber by ID |
| PUT | `/api/subscribers/:id` | Update subscriber |
| POST | `/api/subscribers/:id/subscribe` | Subscribe to topics |
| POST | `/api/subscribers/:id/unsubscribe` | Unsubscribe from topics |
| DELETE | `/api/subscribers/:id` | Delete subscriber |
| **Content** |
| POST | `/api/content` | Create content |
| GET | `/api/content` | Get all content |
| GET | `/api/content/:id` | Get content by ID |
| PUT | `/api/content/:id` | Update content |
| DELETE | `/api/content/:id` | Delete content |

### Detailed API Examples

#### 1. Create a Topic

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technology",
    "description": "Latest tech news and updates"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Topic created successfully",
  "data": {
    "id": "uuid-here",
    "name": "Technology",
    "description": "Latest tech news and updates",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Create a Subscriber

```bash
curl -X POST http://localhost:3000/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "topicIds": ["topic-uuid-here"]
  }'
```

#### 3. Create Scheduled Content

```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "topic-uuid-here",
    "title": "Weekly Tech Update",
    "body": "Here are this week'\''s top tech stories...",
    "scheduledTime": "2024-12-01T10:00:00Z"
  }'
```

**Note**: Use ISO 8601 format for `scheduledTime` (e.g., `2024-12-01T10:00:00Z`)

#### 4. Subscribe to Topics

```bash
curl -X POST http://localhost:3000/api/subscribers/{subscriber-id}/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "topicIds": ["topic-uuid-1", "topic-uuid-2"]
  }'
```

#### 5. Get All Topics

```bash
curl http://localhost:3000/api/topics
```

#### 6. Get Statistics

```bash
curl http://localhost:3000/api/content/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContent": 10,
    "sentContent": 5,
    "pendingContent": 5,
    "totalSentLogs": 50,
    "successfulSends": 48,
    "failedSends": 2
  }
}
```

##  How It Works

### Automated Email Sending Flow

1. **Content Creation**: Create content with a scheduled time via API
2. **Scheduler Check**: Cron job runs every minute
3. **Content Detection**: Finds content where `scheduledTime <= now` and `sent = false`
4. **Subscriber Lookup**: Gets all active subscribers for the content's topic
5. **Email Sending**: Sends email to each subscriber
6. **Logging**: Records success/failure in `SentLog` table
7. **Mark Complete**: Updates content `sent = true`

### Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Topics    │◄──────┤  Subscribers │──────►│   Content   │
└─────────────┘       └──────────────┘       └─────────────┘
      │                                              │
      │                                              │
      └──────────────────┬───────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   SentLog    │
                  └──────────────┘
```

##  Deployment

### Deploy to Railway (Recommended)

1. **Create Account**: Sign up at [Railway.app](https://railway.app/)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

4. **Set Environment Variables**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Newsletter Service
   NODE_ENV=production
   ```

5. **Deploy**:
   - Railway auto-deploys on git push
   - Run migrations: `npm run prisma:deploy`

### Deploy to Render

1. **Create Account**: Sign up at [Render.com](https://render.com/)

2. **Create PostgreSQL Database**:
   - New → PostgreSQL
   - Copy the "Internal Database URL"

3. **Create Web Service**:
   - New → Web Service
   - Connect your repository
   - Build Command: `npm install && npm run build && npm run prisma:deploy`
   - Start Command: `npm start`

4. **Environment Variables**:
   - Add all variables from `.env.example`
   - Use the PostgreSQL URL from step 2

5. **Deploy**: Render auto-deploys on git push

### Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-newsletter-service

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set EMAIL_FROM=your-email@gmail.com

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:deploy
```

##  Testing the Service

### Using cURL

```bash
# 1. Create a topic
TOPIC_ID=$(curl -s -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech News","description":"Technology updates"}' \
  | jq -r '.data.id')

# 2. Create a subscriber
SUBSCRIBER_ID=$(curl -s -X POST http://localhost:3000/api/subscribers \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"name\":\"Test User\",\"topicIds\":[\"$TOPIC_ID\"]}" \
  | jq -r '.data.id')

# 3. Schedule content (sends in 2 minutes)
SCHEDULED_TIME=$(date -u -v+2M +"%Y-%m-%dT%H:%M:%SZ")
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -d "{\"topicId\":\"$TOPIC_ID\",\"title\":\"Test Newsletter\",\"body\":\"This is a test.\",\"scheduledTime\":\"$SCHEDULED_TIME\"}"

# 4. Wait 2 minutes and check logs
curl http://localhost:3000/api/content/stats
```

### Using Postman

1. Import the API endpoints into Postman
2. Create a new environment with `baseUrl = http://localhost:3000/api`
3. Follow the workflow: Topics → Subscribers → Content

### Using Prisma Studio

```bash
npm run prisma:studio
```

Opens a GUI at `http://localhost:5555` to view/edit database records.

##  Monitoring & Logs

### View Logs

```bash
# Development
npm run dev

# Production (if using PM2)
pm2 logs newsletter-service
```

### Check Scheduler Status

The scheduler logs every minute:
```
[2024-01-01T10:00:00.000Z] No scheduled content to send
[2024-01-01T10:01:00.000Z] Found 1 content(s) to send
 Sending "Weekly Update" to 5 subscriber(s)
 Email sent to user@example.com
 Completed sending content: Weekly Update
```

##  Limitations & Improvements

### Current Limitations

1. **Scalability**:
   - In-process cron scheduler (single instance)
   - Sequential email sending
   - No retry mechanism for failed emails

2. **Email Rate Limits**:
   - Gmail: 500 emails/day
   - No rate limiting implemented

3. **Timezone Handling**:
   - All times stored in UTC
   - No per-user timezone support

4. **Security**:
   - No authentication/authorization
   - No API rate limiting
   - No input sanitization for email content

5. **Monitoring**:
   - Basic console logging only
   - No alerting for failures

### Proposed Improvements

#### Short-term (1-2 weeks)

1. **Authentication & Authorization**:
   ```typescript
   // Add JWT-based auth
   import jwt from 'jsonwebtoken';
   // Implement role-based access control
   ```

2. **Email Queue**:
   ```typescript
   // Use Bull queue for better email handling
   import Queue from 'bull';
   const emailQueue = new Queue('email', process.env.REDIS_URL);
   ```

3. **Retry Logic**:
   ```typescript
   // Implement exponential backoff
   const retryEmail = async (email, maxRetries = 3) => {
     // Retry logic here
   };
   ```

4. **Rate Limiting**:
   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   ```

#### Medium-term (1-2 months)

1. **Distributed Scheduler**:
   - Use Redis + Bull for distributed cron
   - Horizontal scaling support

2. **Email Templates**:
   - HTML template engine (Handlebars/EJS)
   - Template management via API
   - Dynamic content injection

3. **Analytics Dashboard**:
   - Open rate tracking (pixel tracking)
   - Click tracking (link wrapping)
   - Subscriber engagement metrics

4. **Advanced Features**:
   - A/B testing for subject lines
   - Personalization tokens
   - Unsubscribe links
   - Email preferences page

#### Long-term (3-6 months)

1. **Microservices Architecture**:
   - Separate email service
   - Separate scheduler service
   - API gateway

2. **Advanced Scheduling**:
   - Recurring newsletters (daily, weekly, monthly)
   - Optimal send time per subscriber
   - Timezone-aware delivery

3. **Machine Learning**:
   - Predict best send times
   - Content recommendations
   - Churn prediction

4. **Enterprise Features**:
   - Multi-tenancy
   - White-labeling
   - Custom SMTP per tenant
   - Advanced reporting

##  Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Email Not Sending

1. **Check SMTP credentials**:
   ```bash
   # Test SMTP connection
   curl -v telnet://smtp.gmail.com:587
   ```

2. **Verify email config**:
   - Check `.env` file
   - Ensure app password (not regular password)
   - Check firewall/network restrictions

3. **Check logs**:
   ```bash
   # Look for SMTP errors
   npm run dev | grep -i smtp
   ```

### Scheduler Not Running

1. **Check server logs** for "Scheduler initialized"
2. **Verify content exists** with `scheduledTime` in the past
3. **Check `sent` field** is `false`

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

##  Author

@LAKSHAY AGGARWAL

Created as part of a technical assessment to demonstrate:
- System design skills
- API development
- Database modeling
- Automated task scheduling
- Email integration
- Documentation abilities

