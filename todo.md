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


## Bug Fixes (Current)
- [x] Fix logout button not working after registration


## Musician Document Verification
- [x] Add musician verification document schema to database
- [x] Create backend routes for document upload and verification
- [x] Create document upload UI for musicians
- [x] Add admin panel to review and approve musician documents
- [ ] Block listing publication until documents verified


## Admin Document Feedback
- [x] Add feedback field to document rejection
- [x] Update admin UI to include feedback textarea
- [x] Display feedback to musicians on rejected documents
- [ ] Allow admin to edit feedback after rejection


## Bug Fixes (Current Session)
- [x] Fix logout button not working after musician registration


## Xendit Payment Integration
- [x] Setup Xendit API and environment variables
- [x] Create payment schema and database tables
- [x] Implement payment processing routes
- [x] Build escrow and commission logic
- [ ] Create booking payment UI
- [ ] Create admin payment dashboard
- [ ] Setup webhook handlers for payment status updates
- [ ] Implement automated payout system


## Bug Fixes (Current Session 2)
- [x] Fix musician document upload - add file picker and upload functionality


## UI Improvements
- [x] Improve musician listings screen layout and form display


## Bug Fixes (Current Session 3)
- [x] Fix React key warning in featured musicians list

## UI Improvements (Current Session 4)
- [x] Improve musician listings form with dropdown selectors for category and other suitable fields
- [x] Redesign musician listing display with professional UI (kemas, professional card design, visual hierarchy)

## Bug Fixes (Current Session 5)
- [x] Fix "Unable to transform response from server" error during login (added genre field to router schemas)
- [x] Fix logout API call failed error (server restart resolved)

## UI Improvements (Current Session 6)
- [x] Improve musician listing form modal layout - better spacing, clear fonts, no overlapping text
- [x] Fix overlapping text in form (picker items overlapping with field labels below)
- [x] Replace inline pickers with separate modal pickers to fully resolve overlap issue

## Bug Fixes (Current Session 7)
- [x] Fix musician cannot delete listing (changed soft-delete to hard-delete, added missing icons, added confirmation dialog)

## Musician Dashboard (Current Session 8)
- [x] Header with stage name, verification status, availability toggle
- [x] KPI cards (upcoming bookings, new requests, monthly revenue, avg rating, escrow, profile completion)
- [x] Upcoming bookings list with quick actions
- [x] New inquiries list with Lihat & Respons button
- [x] To-do / Alerts section
- [x] Quick actions (Update Availability, Add Package, Upload Media, Withdraw/Payout)
- [x] Earnings summary card (gross, monthly, escrow, total gigs)
- [x] Enhanced getMusicianStats API with comprehensive data

## Profile Tab Rebuild (Current Session 17)
- [x] Build Profile main screen with header (photo, stage name, rating, verification)
- [x] Add Profile Strength card with progress bar and checklist
- [x] Create menu cards (Packages, Media, Equipment & Rider, Policies, Settings, Help & Disputes)
- [x] Create Packages screen (reuse existing packages.tsx)
- [x] Create Media screen (Highlight video + Gallery)
- [x] Create Equipment & Rider screen
- [x] Create Policies screen (Deposit %, Cancellation, Overtime)
- [x] Create Settings screen (Notifications, Availability rules, Security, Account)
- [x] Create Help & Disputes screen

## Wallet Screen Implementation (Current Session 16)
- [x] Build Wallet UI with segmented tabs (Today/Week/Month)
- [x] Add Balance card with "Available to cash out" amount and Cash out CTA
- [x] Implement Pending (Escrow) section with job list
- [x] Add Earnings Summary (Gross, Platform fee, Net)
- [x] Build Latest Transactions list with "See all" link
- [ ] Create Transactions screen with filter chips (deferred)
- [ ] Create Payout setup screen for KYC (deferred)

## Calendar Screen Implementation (Current Session 15)
- [x] Build Calendar UI with month selector and Auto-buffer toggle
- [x] Implement weekly strip with day tiles and dot indicators
- [x] Build week view with time blocks (Booked/Hold/Blocked)
- [x] Add floating "Block time" CTA button
- [x] Implement Block time bottom sheet (date/time picker, reason chips, Save)
- [x] Add tap handlers for viewing job/hold/block details

## Jobs Screen Implementation (Current Session 14)
- [x] Build Jobs screen structure with segmented tabs (Requests, Confirmed, Past)
- [x] Add search bar and filter chips
- [x] Implement Requests tab with job request cards and actions (Send quote, Ask, Decline)
- [x] Implement Confirmed tab with countdown and payment progress
- [x] Implement Past tab with completed jobs and review prompts
- [x] Add empty states for all tabs

## Musician Dashboard Rebuild (Current Session 13)
- [x] Update musician tab layout to 5 tabs (Home, Jobs, Calendar, Wallet, Profile)
- [x] Rebuild Home screen with new design (hero card, requests carousel, quick stats, to-do)
- [x] Create Jobs screen placeholder
- [x] Create Calendar screen placeholder
- [x] Create Wallet screen placeholder
- [ ] Move Bookings, Packages, Documents under Profile → Settings

## i18n Implementation (Current Session 12)
- [ ] Create language context and provider
- [ ] Create useTranslation hook
- [ ] Create complete EN translation file
- [ ] Create complete MS translation file
- [ ] Integrate i18n into musician screens
- [ ] Integrate i18n into user screens
- [ ] Integrate i18n into auth screens
- [ ] Add language toggle button in settings/profile
- [ ] Persist language preference in AsyncStorage
- [x] Translate tab labels to English

## Language Localization (Current Session 11)
- [x] Convert musician dashboard to Bahasa Melayu (already in Malay)
- [x] Convert profile editor to Bahasa Melayu (already in Malay)
- [x] Convert packages screen to Bahasa Melayu (EVENT_TYPES translated)
- [x] Convert bookings screen to Bahasa Melayu (already in Malay)
- [x] Convert documents screen to Bahasa Melayu (already in Malay)
- [x] Convert user screens to Bahasa Melayu (already in Malay)

## UI Cleanup (Current Session 10)
- [x] Remove Listing tab from musician dashboard
- [x] Remove Kalendar tab from musician dashboard
- [x] Delete unused listings.tsx file
- [x] Delete unused calendar.tsx file
- [x] Fix dashboard quick action buttons to point to correct routes (profile and packages)

## Profile & Package Management (Current Session 9)
- [x] Extend database schema for profile fields (realName, languages, travelRadius, travelFee, socialLinks, lineupType, members, skills, setlist, equipment, venueRequirements, techRider)
- [x] Create packages table schema (name, eventType, duration, sets, breakTime, basePrice, inclusions, addOns, rules)
- [x] Build profile editor with 3 tabs (About, Line-up & Skills, Equipment & Rider)
- [x] Add preview panel showing customer view
- [x] Add profile strength meter and checklist
- [x] Build package cards list with Popular/Best Value tags
- [x] Build package editor with pricing rules (overtime, deposit, lead time, availability constraints)
- [x] Add Save draft / Publish / Preview as customer actions
- [x] Create separate packages.tsx screen with comprehensive UI
- [x] Add packages tab to musician layout
- [x] Implement package CRUD operations (create, read, update, delete, duplicate)
- [x] Add package router endpoints and database functions


## Musician Dashboard Audit (Current Session 18)
- [x] Audit Home tab (hero card, requests carousel, stats chips, to-do card, availability toggle)
- [x] Audit Jobs tab (Requests/Confirmed/Past tabs, search, filters, action buttons)
- [x] Audit Calendar tab (week view, time blocks, block time functionality)
- [x] Audit Wallet tab (balance, escrow, earnings, transactions)
- [x] Audit Profile tab (main screen, all 6 submenu screens)
- [x] Fix any broken features or missing integrations
- [x] Test all action buttons and navigation flows

## Bug Fixes (Current Session 19)
- [x] Fix tab bar showing submenu screens (help, media, policies, settings, equipment, profile-editor) as separate tabs
- [x] Only show 5 main tabs: Home, Jobs, Calendar, Wallet, Profile

## Comprehensive Dashboard Audit (Session 20)
- [x] Audit Home tab - all buttons, navigation, data display
- [x] Audit Jobs tab - all 3 sub-tabs, action buttons, search/filter (fixed Request review button)
- [x] Audit Calendar tab - week view, block time, event display (fixed month selector, event tap, date/time pickers, advanced rules)
- [x] Audit Wallet tab - balance, transactions, cash out (fixed transaction tap, cash out, see all)
- [x] Audit Profile tab - header, strength card, menu navigation (fixed Complete Now handler)
- [x] Audit Media screen - video/photo pickers, delete (functional with ImagePicker)
- [x] Audit Equipment screen - add/edit/delete items (functional with local state)
- [x] Audit Policies screen - form inputs, save (functional with alert feedback)
- [x] Audit Settings screen - toggles, navigation (functional)
- [x] Audit Help screen - FAQ, support actions (functional)
- [x] Audit Packages screen - CRUD operations (functional with tRPC)
- [x] Audit Profile Editor screen - form fields, save (functional with tRPC)
- [x] Fix all broken/empty handlers found (0 empty onPress remaining)

## Bug Fix - Profile Update Failure (Session 21)
- [x] Investigate musician profile update failure
- [x] Check profile editor form submission and tRPC mutation
- [x] Check backend updateProfile route and database query
- [x] Fix the issue and verify profile updates work

## Profile Photo Upload Feature (Session 22)
- [x] Add image picker integration to profile screen
- [x] Implement S3 upload for profile photos (local URI for now, S3 integration deferred)
- [x] Update profile screen UI with avatar and upload button
- [x] Connect photo upload to updateProfile mutation
- [x] Test photo upload end-to-end

## Customer Dashboard Build (Session 23)
- [x] Create customer app layout with 5 tabs (Home, Explore, Bookings, Messages, Profile)
- [x] Build Home tab (location selector, search, hero card, categories, carousels, book again)
- [x] Build Explore tab (search, filters, musician cards, musician profile view)
- [x] Build booking flow (5-step stepper: event details, package selection, add-ons, summary, confirmation)
- [x] Build Bookings tab (upcoming/pending/past tabs, booking cards, booking detail view)
- [x] Build Messages tab (chat threads, chat screen, quick replies)
- [x] Build Profile tab (account info, addresses, payment methods, favorites, settings)
- [x] Test all customer dashboard features end-to-end

## Email Verification & Post-Signup Routing (Session 24)
- [x] Add email verification screen after signup
- [x] Implement email verification logic (OTP/verification link)
- [x] Update signup flow to require email verification
- [x] Redirect users directly to dashboard after verification (customer or musician based on role)
- [x] Add email verification resend functionality
- [x] Test email verification end-to-end

## Live Musician Data Integration (Session 25)
- [x] Create tRPC queries for fetching musicians (list, search, filter)
- [x] Update Home tab to show real featured/top-rated musicians
- [x] Update Explore tab to show real musicians with search and filters
- [x] Update Musician Profile screen to show real musician data
- [x] Connect booking flow to real musician packages
- [x] Test live data integration end-to-end

## Debug Customer Dashboard Data Display (Session 26)
- [x] Check if musicians exist in database
- [x] Verify tRPC API returns musician data correctly
- [x] Check customer dashboard API calls and data normalization
- [x] Fix any issues preventing musician data from displaying (approved user status + set verified flag)
- [x] Test customer dashboard shows real musicians
