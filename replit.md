# Overview

RádioPlay - A Portuguese-language platform about earning money by listening to radio. Built with React and Express.js using TypeScript, following a monorepo structure. Features a modern UI with shadcn/ui components and includes user authentication flow with dashboard for radio selection.

## Recent Updates (22/09/2025)
- **Sistema de Alôs Restrito a Usuários Premium**:
  - ✅ Modificado fluxo de envio de "Alôs" para exigir assinatura Premium
  - ✅ Criado novo modal PremiumAloModal específico para informar restrição
  - ✅ Verificação automática de status premium ao abrir modal de mensagem
  - ✅ Badge visual "⭐ Premium" no cabeçalho do modal para usuários premium
  - ✅ Lista de benefícios premium apresentada no modal de restrição
  - ✅ Redirecionamento automático para página de perfil com destaque no plano premium

## Recent Updates (21/09/2025)
- **Sistema de Notificações Push Completo**:
  - ✅ Firebase Cloud Messaging (FCM) configurado para iOS, Android e Desktop
  - ✅ Service Worker atualizado para receber notificações em background
  - ✅ NotificationManager criado para gerenciar permissões e tokens
  - ✅ Componente UI de configurações de notificações no perfil do usuário
  - ✅ Backend com endpoints para registrar dispositivos e enviar notificações
  - ✅ Tabela push_tokens no banco de dados para rastreamento
  - ✅ Suporte completo para PWA offline com notificações
- **Corrigido erro de autenticação em produção (Railway)**:
  - ✅ Adicionado trust proxy para Railway HTTPS
  - ✅ Configurado CORS com credentials para cookies
  - ✅ Ajustado cookies seguros com SameSite=none em produção
  - ✅ Criado guia de deploy RAILWAY_DEPLOY.md
  - ✅ Testado login e conversão de pontos funcionando

## Recent Updates (20/09/2025)
- **PWA Implementation (100% Complete)**:
  - ✅ Service Worker with offline caching strategy
  - ✅ Manifest.json with full configuration
  - ✅ 12 PWA icons in different sizes (16px to 512px)
  - ✅ iOS/Android meta tags for full compatibility
  - ✅ Install button component (PWAInstallButton)
  - ✅ Install prompt with platform detection
  - ✅ Support for Android (Chrome), iPhone (Safari), and Desktop installation
- Fixed message overflow issue in PIX payment modal
- Improved error handling for insufficient points during conversion
- Implemented UTM parameter tracking system with proper persistence

## Recent Updates (19/09/2025)
- Enhanced Profile page with responsive design and user stats
- Implemented Edit Profile, Withdrawal History, and FAQ modals
- Redesigned Resgatar page with improved visual hierarchy
- Added Premium Upgrade modal with gradient styling
- Fixed modal positioning and duplicate close buttons
- Standardized font sizes across all pages for consistency
- Improved mobile responsiveness for all modals

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