# Architecture Overview

## 1. Overview

The GOVCIO-SAMS ELT PROGRAM is a School Administration Management System (SAMS) for aviation training, supporting three schools: KFNA, NFS East, and NFS West. The application is designed to track instructors, courses, students, test results, evaluations, and other administrative tasks for English Language Training (ELT) programs.

The system is built as a full-stack web application with a React frontend and a Node.js Express backend. It uses a PostgreSQL database managed through Drizzle ORM. The application follows a modern architecture with clear separation between the client and server components, connected via REST APIs.

## 2. System Architecture

The application follows a client-server architecture with the following main components:

```
┌─────────────┐           ┌──────────────┐           ┌──────────────┐
│             │           │              │           │              │
│  React      │◄─────────►│  Express.js  │◄─────────►│  PostgreSQL  │
│  Frontend   │  REST API │  Backend     │   Drizzle │  Database    │
│             │           │              │    ORM    │              │
└─────────────┘           └──────────────┘           └──────────────┘
                                 ▲
                                 │
                                 ▼
                          ┌──────────────┐
                          │  External    │
                          │  Services    │
                          │  - OpenAI    │
                          │  - Perplexity│
                          │  - SendGrid  │
                          └──────────────┘
```

### Key Architectural Patterns

1. **REST API**: The backend exposes RESTful endpoints for client-server communication
2. **React Query**: Used for data fetching, caching, and state management on the client
3. **Drizzle ORM**: Type-safe database access layer with migrations support
4. **JWT Authentication**: Session-based authentication with Passport.js
5. **Component-Based UI**: UI built with React and Shadcn/UI components
6. **Feature-Based Organization**: Code is organized by feature rather than type

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is built with React and TypeScript, using modern patterns and libraries:

- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: React Query for server state, React Context for global state
- **UI Components**: Shadcn/UI (based on Radix UI) with Tailwind CSS
- **Data Visualization**: Recharts for charts and visualizations
- **Forms**: React Hook Form with Zod validation

The frontend follows a feature-based structure:
```
client/src/
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── pages/            # Page components
└── utils/            # Helper functions
```

### 3.2 Backend Architecture

The backend is built with Node.js, Express, and TypeScript:

- **Framework**: Express.js with TypeScript
- **API Structure**: RESTful API endpoints
- **Database Access**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy
- **File Storage**: Local file system with multer
- **AI Integration**: OpenAI and Perplexity AI services

The backend follows a layered architecture:
```
server/
├── db.ts             # Database connection
├── routes.ts         # API routes definition
├── auth.ts           # Authentication logic
├── storage.ts        # Data access layer
├── services/         # External service integrations
├── utils/            # Utility functions
└── migrations/       # Database migrations
```

### 3.3 Database Schema

The system uses PostgreSQL with Drizzle ORM for schema management. Key entities include:

- **Schools**: Representing the three aviation training schools
- **Instructors**: ELT instructors with personal and professional information
- **Courses**: Training courses with schedules and enrollment information
- **Students**: Military personnel enrolled in courses
- **TestResults**: Test scores for various assessment types
- **Evaluations**: Instructor performance evaluations
- **StaffAttendance**: Tracking instructor attendance
- **StaffLeave**: Managing instructor leave requests
- **Documents**: System documents and files
- **Users**: System users with authentication information

### 3.4 Authentication and Authorization

The system implements session-based authentication using:

- **Passport.js**: For authentication middleware
- **connect-pg-simple**: For PostgreSQL session storage
- **Crypto**: For password hashing using scrypt with salt
- **Role-based Access**: Different user roles (admin, instructor, etc.)

## 4. Data Flow

### 4.1 Request-Response Flow

1. Client sends HTTP request to the Express backend
2. Authentication middleware validates the user session
3. Request is routed to the appropriate handler
4. Handler calls storage methods to interact with the database
5. Response is formatted and returned to the client
6. React Query caches the response for future use

### 4.2 Data Access Patterns

- **Read Operations**: Use Drizzle's query builder with filtering and pagination
- **Write Operations**: Use Drizzle's typed insert/update/delete operations
- **Transactions**: Used where data integrity across multiple operations is required

### 4.3 Real-time Updates

- The system currently uses polling via React Query for near-real-time updates
- No WebSocket implementation is present for true real-time capabilities

## 5. External Dependencies

### 5.1 AI Services

The application integrates with AI services for enhanced functionality:

- **OpenAI**: Used for content generation and document analysis
- **Perplexity AI**: Alternative AI service for specific use cases
- **Local Fallbacks**: Text analysis functions for cases when AI services are unavailable

### 5.2 Email Integration

- **SendGrid**: Used for transactional emails (password resets, notifications)

### 5.3 Database Services

- **Neon Database**: Serverless PostgreSQL (@neondatabase/serverless package)

## 6. Deployment Strategy

The application is configured for deployment on Replit, with specific adaptations:

### 6.1 Build Process

1. **Frontend**: Built with Vite, outputs to `dist/public`
2. **Backend**: Bundled with esbuild to `dist/index.js`
3. **Combined Deployment**: Single package with static frontend served by backend

### 6.2 Environment Configuration

- Environment variables for configuration (DATABASE_URL, etc.)
- Different configurations for development and production environments

### 6.3 Database Migration

- Database schema is managed through Drizzle with migration scripts
- `initDatabase` function ensures proper schema setup on application start

### 6.4 CI/CD

- The repository includes Replit-specific configuration for continuous deployment
- Automated builds triggered on code changes

## 7. Future Considerations

Areas for potential architectural improvement:

1. **Real-time Updates**: Implementing WebSockets for true real-time features
2. **Microservices**: Splitting monolith into specialized services as the application grows
3. **Caching Layer**: Adding Redis or similar for improved performance
4. **Test Coverage**: Implementing comprehensive testing strategy
5. **API Versioning**: Adding versioning to support evolving client requirements