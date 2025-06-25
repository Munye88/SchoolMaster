# GOVCIO-SAMS ELT Program Management System

## Overview

This is a comprehensive web application for managing an English Language Training (ELT) program across three naval schools: KFNA, NFS East, and NFS West. The system manages instructors, students, evaluations, attendance, and various administrative functions for aviation training programs.

## System Architecture

The application follows a full-stack architecture with:

- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **File Storage**: Local file system with multer for uploads
- **AI Integration**: OpenAI GPT-4o and Perplexity AI for intelligent assistance

## Key Components

### Frontend Architecture
- React 18 with TypeScript for type safety
- Vite for fast development and optimized builds
- TanStack Query for server state management
- React Hook Form with Zod validation
- Responsive design with Tailwind CSS
- Component library built on Radix UI primitives

### Backend Architecture
- Express.js server with TypeScript
- RESTful API design with comprehensive error handling
- Session-based authentication with PostgreSQL session store
- File upload handling with type validation
- Database migrations system for schema evolution
- Comprehensive logging and monitoring

### Database Schema
The system manages multiple interconnected entities:
- **Schools**: Three naval academies (KFNA, NFS East, NFS West)
- **Instructors**: ELT instructors with personal and professional details
- **Students**: Student enrollment and tracking
- **Courses**: Course management and scheduling
- **Evaluations**: Performance evaluations with scoring
- **Test Results**: ALCPT, Book tests, and ECL test tracking
- **Attendance**: Staff attendance monitoring
- **Events**: Calendar and scheduling system
- **Documents**: File management for policies and procedures

## Data Flow

1. **Authentication Flow**: Users authenticate via username/password, creating secure sessions
2. **Dashboard Analytics**: Real-time statistics aggregated from multiple data sources
3. **CRUD Operations**: Standard create, read, update, delete operations for all entities
4. **File Processing**: Resume uploads processed with AI for candidate information extraction
5. **AI Integration**: Natural language queries processed by OpenAI and Perplexity APIs
6. **Real-time Updates**: Live data updates through API polling

## External Dependencies

### Database
- PostgreSQL 16 for data persistence
- Connection pooling for performance optimization
- SSL support for production environments

### AI Services
- **OpenAI GPT-4o**: Advanced text analysis, data insights, and chat assistance
- **Perplexity AI**: Web-enabled search and current information retrieval
- **Anthropic Claude**: Secondary AI service for specialized tasks

### Email Services
- SendGrid for automated email notifications
- Password reset and administrative communications

### File Processing
- PDF parsing capabilities for resume analysis
- Image processing for instructor photos
- Document type validation and security checks

## Deployment Strategy

### Development Environment
- Replit with Node.js 20 runtime
- PostgreSQL 16 database
- Hot module replacement for rapid development
- Automatic dependency management

### Production Deployment
- Docker containerization with multi-stage builds
- Render.com cloud deployment with auto-scaling
- Environment variable management for secrets
- Database migrations run automatically on deployment
- Health checks and monitoring

### Build Process
1. Frontend assets compiled with Vite
2. Backend TypeScript compiled with esbuild
3. Database schema pushed with Drizzle migrations
4. Static assets served from Express server

## Recent Changes
- June 24, 2025: Initial setup and basic functionality
- January 2025: Replaced sidebar navigation with top navigation layout
- January 2025: Enhanced test tracker with Excel upload functionality
- January 2025: Updated color scheme to navy blue (#0A2463) primary color
- January 2025: Added nationality flags display in dashboard header
- January 2025: Integrated quick links directly into dashboard
- January 2025: Fixed distribution by school to show student counts
- June 24, 2025: Fixed instructor update functionality with proper cache invalidation
- June 24, 2025: Created school home pages with navigation to staff attendance and other school-specific features
- June 24, 2025: Enhanced instructor records with comprehensive fields including email, passport, emergency contacts, salary, department, and employment status
- June 24, 2025: Updated database schema to support extended instructor information
- June 24, 2025: Improved instructor management UI with enhanced forms and better data display
- June 25, 2025: Fixed dashboard course progress calculation to show actual progress percentages
- June 25, 2025: Removed instructor names from active courses display as requested
- June 25, 2025: Fixed distribution by school data to show real-time student counts
- June 25, 2025: Implemented employee handbook upload functionality with document management
- June 25, 2025: Created real-time reports component with enhanced data integration and AI-powered recommendations
- June 25, 2025: Updated dashboard statistics to use real-time data instead of cached values
- June 25, 2025: Prepared application for deployment with all requested features implemented
- June 25, 2025: Fixed nationality count display issue - updated dashboard to show correct American (40), British (30), and Canadian (3) instructor counts
- June 25, 2025: Resolved technical database schema errors and ensured all data displays correctly in real-time
- June 25, 2025: Application fully ready for production deployment with all dashboard statistics working properly
- June 25, 2025: Moved quick access links (instructor lookup and course management) to top of dashboard for better accessibility based on user preference
- June 25, 2025: Fixed instructor profile display issues and ensured all instructor and student data integrity is maintained
- June 25, 2025: Complete instructor profile system implemented with comprehensive backend and frontend infrastructure
- June 25, 2025: Added individual instructor profile pages with detailed information display
- June 25, 2025: Created GitHub deployment setup with README and deployment documentation
- June 25, 2025: System ready for production deployment with all 73 instructor records and 5 student records intact
- June 25, 2025: Complete backend restoration of all 73 instructor profiles with enhanced API endpoints
- June 25, 2025: Added comprehensive CORS headers and caching for transferred website compatibility
- June 25, 2025: Enhanced instructor profile endpoints with detailed logging and error handling
- June 25, 2025: Verified data integrity - all 73 instructor profiles accessible with complete information
- June 25, 2025: Fixed instructor profile navigation for transferred website compatibility
- June 25, 2025: Added multiple route handlers for instructor profiles (/instructor/profile/:id, /instructor/:id)
- June 25, 2025: Enhanced error handling and logging for transferred website debugging
- June 25, 2025: System fully deployed and ready for production use on transferred website
- June 25, 2025: Fixed school instructor profile navigation - clicking instructor icon under school bar now leads directly to individual profiles
- June 25, 2025: Updated View Profile buttons to bypass modal and navigate directly to /instructor/profile/:id
- June 25, 2025: Enhanced navigation workflow: School bar → Instructor icon → View Profile/View button → Individual profile page
- June 25, 2025: Fixed dashboard box alignment and title centering issues for better visual consistency
- June 25, 2025: Improved dashboard layout with centered content and responsive grid system
- June 25, 2025: Fixed database schema compatibility issues for GitHub/Render deployment
- June 25, 2025: Resolved "email column does not exist" error with proper database migration
- June 25, 2025: Enhanced dashboard box centering with min-height and flex positioning
- June 25, 2025: System fully prepared for GitHub → Render deployment pipeline
- June 25, 2025: CRITICAL FIX: Updated database initialization to include all instructor columns during fresh deployment
- June 25, 2025: Fixed "email column does not exist" error in initDb.ts for Render compatibility
- June 25, 2025: Database schema now complete with all extended instructor fields for production deployment
- June 25, 2025: Created complete schema migration that runs before database initialization for fresh deployments
- June 25, 2025: Added ensureCompleteSchema function to guarantee all tables and columns exist before seeding
- June 25, 2025: Transformed dashboard to compact professional rectangular design - reduced all element heights and padding for cleaner appearance

## User Preferences

Preferred communication style: Simple, everyday language.
Navigation preference: Top navigation instead of sidebar for better screen utilization.
Quick access preference: Instructor lookup and course management placed at top of dashboard for frequent use.
Color scheme: Blue primary (#2563EB) with school-specific colors (KFNA: red #E4424D, NFS East: green #22A783, NFS West: purple #6247AA).
Dashboard layout: Nationality flags with counts in header, integrated quick links, removed leadership quote.
Test tracker: Excel upload functionality for ALCPT, Book Test, ECL, and OPI scores with automatic calculations.