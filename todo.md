# Gigbook Project TODO

## Database & Backend
- [x] Create database schema (users, musicians, listings, bookings, payments, settings)
- [x] Implement database queries and helpers
- [x] Create tRPC routers for all features
- [x] Run database migrations

## Authentication & Roles
- [x] Extend user table with role field (admin/musician/user)
- [x] Create role selection flow after OAuth login
- [x] Implement admin approval system for new users
- [x] Create pending approval screen
- [x] Role-based navigation routing

## Musician Features
- [x] Musician profile setup screen
- [x] Create/edit listing functionality
- [x] Availability calendar management
- [x] Musician dashboard with stats
- [x] Booking requests management (accept/decline)
- [x] Earnings and payout history

## User Features
- [x] Home screen with featured musicians
- [x] Search and filter musicians
- [x] Musician profile view
- [x] Booking flow (select service, date, details)
- [x] Payment integration (escrow)
- [x] My bookings list with status
- [x] Booking detail view

## Payment System
- [x] Escrow payment flow
- [x] 10% commission calculation
- [x] Payout to musician after event completion
- [x] Payment history tracking
- [x] Refund handling

## Cancellation Policy
- [x] 72-hour cancellation window logic
- [x] User cancellation with configurable penalty
- [x] Musician cancellation with penalty + strike
- [x] Strike tracking system
- [x] Auto-suspend after strike limit

## Admin Panel
- [x] Admin dashboard with stats
- [x] User approval management
- [x] Booking approval management
- [x] All bookings management
- [x] Payment/escrow management
- [x] Settings configuration (commission, penalties, strike limits)

## UI/UX
- [x] Theme configuration (colors)
- [x] Tab navigation for each role
- [x] Common components (cards, buttons, modals)
- [x] Loading states and error handling
- [x] Generate app logo

## Testing & Polish
- [x] Test all user flows
- [x] Test payment flows
- [x] Test cancellation scenarios
- [x] Final UI polish


## Bug Fixes
- [x] Fix OAuth redirect URI error for Expo Go (exp:// scheme not allowed)

- [x] Replace OAuth browser login with in-app email/password authentication
- [x] Create login screen with email and password fields
- [x] Create registration screen for new users
- [x] Update backend to support email/password auth with password hashing


## Approval Flow
- [x] Update registration to redirect to pending approval screen
- [x] Block dashboard access for pending users
- [x] Block musician features for pending musicians
- [x] Update app navigation to check approval status


## User Management (Admin)
- [x] Add backend routes for user management (list, delete, suspend)
- [x] Create admin user management screen
- [x] Implement delete user functionality
- [x] Implement suspend user functionality


## Bug Fixes
- [x] Fix logout button not working


## Email Verification
- [x] Add email verification schema to database
- [x] Create email verification token generation
- [ ] Create email sending service
- [x] Create email verification screen
- [x] Update registration flow to require email verification
- [x] Add verification code resend functionality


## Email Validation
- [x] Block temporary/disposable email addresses
- [x] Only allow legitimate email providers (Gmail, Yahoo, Outlook, etc)

