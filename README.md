# GOVCIO-SAMS ELT Program Management System

A comprehensive web application for managing English Language Training (ELT) programs across three naval schools: KFNA, NFS East, and NFS West.

## Features

### Core Management
- **Instructor Management**: Complete profiles with personal, contact, and professional information
- **Student Management**: Track student enrollment and progress across schools
- **Course Management**: Manage courses, schedules, and assignments
- **School Administration**: Multi-school support with role-based access

### Advanced Features
- **Staff Attendance Tracking**: Monitor instructor attendance and leave management
- **Performance Evaluations**: Comprehensive evaluation system for instructors
- **Test Result Tracking**: ALCPT, Book Test, ECL, and OPI score management
- **Real-time Dashboard**: Live statistics and analytics
- **Document Management**: Upload and manage policies, handbooks, and procedures
- **AI-Powered Assistance**: Integrated AI for insights and recommendations

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Top Navigation**: Clean, modern navigation layout
- **Quick Access**: Frequently used features prominently displayed
- **Real-time Updates**: Live data refresh and notifications

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Tailwind CSS** with Radix UI components (shadcn/ui)
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js server
- **TypeScript** for full-stack type safety
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for authentication
- **Multer** for file uploads

### Database
- **PostgreSQL 16** for data persistence
- **Drizzle ORM** for type-safe database operations
- **Database Migrations** for schema evolution

### AI Integration
- **OpenAI GPT-4o** for advanced text analysis and insights
- **Perplexity AI** for web-enabled search and current information
- **Anthropic Claude** for specialized AI tasks

## Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL 16
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/govcio-sams.git
   cd govcio-sams
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/govcio_sams
   SESSION_SECRET=your-session-secret
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser to `http://localhost:5000`

### Default Login
- Username: `munye88`
- Password: `admin123`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── auth.ts           # Authentication logic
│   └── services/         # External service integrations
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── types/               # TypeScript type definitions
```

## Key Features

### Instructor Profiles
- Complete personal and professional information
- Contact details and emergency contacts
- Employment history and credentials
- Profile photos and document attachments
- Comprehensive search and filtering

### Dashboard Analytics
- Real-time statistics across all schools
- Student and instructor counts by nationality
- Course progress tracking
- Performance metrics and trends

### Multi-School Support
- KFNA (King Fahd Naval Academy)
- NFS East (Naval Flight School East)
- NFS West (Naval Flight School West)
- School-specific data and reporting

### Data Management
- Excel import/export functionality
- Comprehensive backup and restore
- Data integrity validation
- Audit logging and tracking

## Database Schema

### Core Tables
- `schools` - School information and settings
- `instructors` - Complete instructor profiles
- `students` - Student enrollment and tracking
- `courses` - Course definitions and schedules
- `evaluations` - Performance evaluation records
- `test_results` - Test scores and results
- `staff_attendance` - Attendance tracking
- `staff_leave` - Leave management

### Supporting Tables
- `users` - Authentication and user management
- `documents` - File storage and management
- `events` - Calendar and scheduling
- `activities` - System activity logging

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/user` - Get current user

### Instructors
- `GET /api/instructors` - List all instructors
- `GET /api/instructors/:id` - Get instructor profile
- `POST /api/instructors` - Create new instructor
- `PATCH /api/instructors/:id` - Update instructor
- `DELETE /api/instructors/:id` - Delete instructor

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create new student
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course
- `PATCH /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

## Deployment

### Development
The application runs on Replit with automatic dependency management and hot reload.

### Production
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Render.com (recommended)
   - Railway
   - AWS
   - Google Cloud Platform

3. **Set up production database**
   - Configure PostgreSQL instance
   - Run database migrations
   - Set environment variables

### Environment Variables
Required for production deployment:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV=production`
- API keys for external services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## Acknowledgments

- Built for GOVCIO SAMS ELT Training Programs
- Supports naval education and training excellence
- Designed for operational efficiency and data integrity