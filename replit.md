# Overview

The Guard Monitoring System (GMS) is a biometric-based attendance tracking application designed to eliminate "ghost workers" from payrolls. The system allows guards to clock in/out using biometric verification (fingerprints and facial recognition as fallback) combined with GPS location verification. It features role-based dashboards for guards, supervisors, HR personnel, and administrators, with real-time monitoring capabilities and comprehensive audit trails.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React 18 with TypeScript, using Vite as the build tool and bundler. The frontend implements a single-page application (SPA) pattern with client-side routing via Wouter.

**UI Framework**: Utilizes shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. This provides a consistent, accessible design system with pre-built components like dialogs, forms, tables, and navigation elements.

**State Management**: Uses TanStack Query (React Query) for server state management, providing caching, synchronization, and optimistic updates. Authentication state is managed through a custom React context provider.

**Component Architecture**: Follows a modular component structure with reusable UI components in `/client/src/components/ui/` and business logic components organized by feature areas (guard app, supervisor dashboard, HR portal, admin panel).

## Backend Architecture

**Framework**: Express.js server with TypeScript, providing RESTful API endpoints for all client-server communication.

**Authentication**: Implements session-based authentication using Passport.js with local strategy. Sessions are stored in PostgreSQL using connect-pg-simple for persistence across server restarts.

**API Design**: RESTful endpoints organized by resource type (guards, sites, attendance, exceptions) with proper HTTP status codes and error handling middleware.

**Real-time Communication**: WebSocket server implementation for live updates of attendance status and exceptions to supervisor dashboards.

## Database Architecture

**Primary Database**: PostgreSQL with Neon serverless hosting for scalability and managed infrastructure.

**ORM**: Drizzle ORM provides type-safe database operations with schema-first approach. Database schema is defined in TypeScript with automatic type generation.

**Schema Design**: Normalized relational schema with tables for users, sites, posts, guards, shifts, attendance records, exceptions, and audit logs. Includes proper foreign key relationships and indexes for performance.

**Data Validation**: Uses Zod for runtime type validation and schema validation, ensuring data integrity between frontend and backend.

## Security & Compliance

**Data Protection**: Implements encryption for sensitive biometric data stored in JSONB fields. The system is designed to comply with Kenya's Data Protection Act (2019).

**Authentication Security**: Password hashing using scrypt with salt for secure credential storage. Session management with configurable expiration and secure cookie settings.

**Audit Trail**: Comprehensive audit logging system tracks all user actions, data changes, and system events with timestamps, IP addresses, and user agents.

## External Dependencies

**Database Hosting**: Neon serverless PostgreSQL for managed database infrastructure with automatic scaling and backups.

**Session Storage**: PostgreSQL-based session store using connect-pg-simple for persistent user sessions.

**Biometric Processing**: Frontend simulation of biometric scanning (fingerprint and facial recognition) - production implementation would integrate with actual biometric hardware/SDKs.

**Geolocation Services**: Browser's native Geolocation API for GPS coordinate capture during clock-in/out operations.

**UI Components**: Radix UI primitives for accessible component foundations, Lucide React for consistent iconography.

**Development Tools**: Vite for fast development and building, with hot module replacement and TypeScript support. Replit-specific plugins for development environment integration.

**Styling Framework**: Tailwind CSS for utility-first styling with custom design tokens and responsive design patterns.