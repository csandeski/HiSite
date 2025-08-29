# Overview

This is a full-stack web application built with React and Express.js using TypeScript. The application follows a monorepo structure with separate client and server directories, featuring a modern UI built with shadcn/ui components and a RESTful API backend. The project is configured for PostgreSQL database integration using Drizzle ORM and includes comprehensive tooling for development and deployment.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Development**: Hot module replacement and error handling with custom Vite plugins

## Data Storage Solutions
- **Primary Database**: PostgreSQL accessed through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Type Safety**: Full TypeScript integration with Drizzle for compile-time query validation
- **Fallback Storage**: In-memory storage interface for development/testing (MemStorage class)

## Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL persistence
- **User Schema**: Basic user model with username/password fields and UUID primary keys
- **Validation**: Zod schemas for user input validation and type safety
- **Security**: Prepared for session-based auth with secure cookie configuration

## External Dependencies
- **Database**: Neon Database for serverless PostgreSQL hosting
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development Tools**: Replit-specific plugins for development environment integration
- **Styling**: Google Fonts integration for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Build Tools**: Vite for frontend bundling, esbuild for server-side compilation
- **Type Checking**: TypeScript with strict configuration for both client and server