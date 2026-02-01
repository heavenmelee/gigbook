# Gigbook Mobile App Design Document

## Overview
Gigbook is an MVP marketplace for booking Malaysian musicians. The app supports three user roles: **Admin**, **Musician**, and **User**. Features include admin-approved bookings, escrow payments with 10% commission, and configurable cancellation policies.

---

## Screen List

### Authentication Screens
1. **Welcome Screen** - App intro with login/register options
2. **Login Screen** - OAuth login via Manus
3. **Role Selection Screen** - New users choose: "I'm a Musician" or "I'm looking for Musicians"
4. **Pending Approval Screen** - Shown to users awaiting admin approval

### User Screens (Customer)
1. **Home Screen** - Featured musicians, search bar, categories
2. **Search Results Screen** - List of musicians with filters (genre, location, price)
3. **Musician Profile Screen** - Bio, portfolio, reviews, pricing, availability calendar
4. **Booking Screen** - Select date, time, venue details, view pricing
5. **Payment Screen** - Payment summary, confirm booking
6. **My Bookings Screen** - List of upcoming/past bookings with status
7. **Booking Detail Screen** - Full booking info, cancel option, chat
8. **Profile Screen** - User profile, settings, logout

### Musician Screens
1. **Musician Dashboard** - Overview: earnings, upcoming gigs, pending requests
2. **My Listings Screen** - Manage service listings
3. **Create/Edit Listing Screen** - Add service details, pricing, photos
4. **Availability Calendar Screen** - Set available dates/times
5. **Booking Requests Screen** - Accept/decline incoming bookings
6. **Booking Detail Screen** - Full booking info, mark complete, chat
7. **Earnings Screen** - Payment history, pending payouts
8. **Profile Screen** - Edit musician profile, portfolio, settings

### Admin Screens
1. **Admin Dashboard** - Overview stats: users, bookings, revenue
2. **User Approvals Screen** - List of pending user registrations
3. **Booking Approvals Screen** - List of bookings pending admin approval
4. **All Bookings Screen** - Manage all bookings, filter by status
5. **Payments Screen** - Escrow management, release payments
6. **Musicians Screen** - View/manage all musicians
7. **Users Screen** - View/manage all users
8. **Settings Screen** - Configure commission, cancellation penalties, strike limits

---

## Primary Content and Functionality

### Home Screen (User)
- **Hero Section**: Search bar with placeholder "Cari musician..."
- **Categories**: Horizontal scroll of music genres (Band, Solo, DJ, Traditional, etc.)
- **Featured Musicians**: Vertical list cards showing photo, name, genre, rating, starting price

### Musician Profile Screen
- **Header**: Cover photo, profile photo, name, verified badge
- **Info Section**: Genre, location, experience years
- **Bio**: Short description
- **Portfolio**: Photo/video gallery
- **Services**: List of available packages with pricing
- **Reviews**: Star rating + recent reviews
- **Availability**: Calendar showing available dates
- **CTA Button**: "Book Now" fixed at bottom

### Booking Flow
- **Step 1**: Select service package
- **Step 2**: Pick date from availability calendar
- **Step 3**: Enter event details (venue, time, special requests)
- **Step 4**: Review booking summary + total price
- **Step 5**: Confirm & Pay (escrow)
- **Step 6**: Await admin approval

### Musician Dashboard
- **Stats Cards**: Total earnings, Pending payouts, Upcoming gigs, Rating
- **Upcoming Gigs**: List of next 3 confirmed bookings
- **Pending Requests**: Action items requiring response
- **Quick Actions**: Add listing, Update availability

### Admin Dashboard
- **Stats Cards**: Total users, Active musicians, Pending approvals, Monthly revenue
- **Pending Actions**: User approvals, Booking approvals, Payment releases
- **Recent Activity**: Timeline of recent bookings/payments

---

## Key User Flows

### New User Registration Flow
1. User opens app → Welcome Screen
2. Tap "Get Started" → OAuth Login
3. After login → Role Selection Screen
4. Select "I'm looking for Musicians" → Pending Approval Screen
5. Admin approves → User can access Home Screen

### New Musician Registration Flow
1. User opens app → Welcome Screen
2. Tap "Get Started" → OAuth Login
3. After login → Role Selection Screen
4. Select "I'm a Musician" → Musician Profile Setup
5. Fill profile details → Submit for approval
6. Admin approves → Musician can access Dashboard

### Booking Flow (User)
1. User searches/browses musicians
2. Tap musician card → Musician Profile
3. Tap "Book Now" → Select service
4. Pick date → Enter event details
5. Review summary → Confirm & Pay
6. Payment held in escrow → Booking status: "Pending Approval"
7. Admin approves → Status: "Confirmed"
8. Event completes → Musician marks complete
9. Admin releases payment (10% commission deducted)

### Cancellation Flow (User cancels within 72 hours)
1. User opens Booking Detail
2. Tap "Cancel Booking"
3. Warning shown: "Cancellation within 72 hours incurs X% penalty"
4. User confirms → Penalty deducted from refund
5. Remaining amount refunded to user
6. Musician notified

### Cancellation Flow (Musician cancels within 72 hours)
1. Musician opens Booking Detail
2. Tap "Cancel Booking"
3. Warning shown: "Cancellation within 72 hours incurs penalty + strike"
4. Musician confirms → Penalty applied, strike recorded
5. User receives full refund
6. If strikes exceed limit → Account suspended

---

## Color Choices

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | #6366F1 (Indigo) | #818CF8 | Main CTA, highlights |
| `background` | #FFFFFF | #0F172A | Screen backgrounds |
| `surface` | #F8FAFC | #1E293B | Cards, elevated surfaces |
| `foreground` | #0F172A | #F8FAFC | Primary text |
| `muted` | #64748B | #94A3B8 | Secondary text |
| `border` | #E2E8F0 | #334155 | Borders, dividers |
| `success` | #10B981 | #34D399 | Confirmed, completed |
| `warning` | #F59E0B | #FBBF24 | Pending, attention |
| `error` | #EF4444 | #F87171 | Cancelled, errors |
| `accent` | #EC4899 (Pink) | #F472B6 | Featured, premium |

---

## Navigation Structure

### Tab Bar (User Role)
1. **Home** (house.fill) - Browse musicians
2. **Search** (magnifyingglass) - Search & filter
3. **Bookings** (calendar) - My bookings
4. **Profile** (person.fill) - Settings

### Tab Bar (Musician Role)
1. **Dashboard** (house.fill) - Overview
2. **Listings** (music.note.list) - My services
3. **Calendar** (calendar) - Availability
4. **Earnings** (dollarsign.circle.fill) - Payments
5. **Profile** (person.fill) - Settings

### Tab Bar (Admin Role)
1. **Dashboard** (house.fill) - Overview
2. **Approvals** (checkmark.circle.fill) - Pending approvals
3. **Bookings** (calendar) - All bookings
4. **Payments** (dollarsign.circle.fill) - Escrow management
5. **Settings** (gear) - Configuration

---

## Component Patterns

### Musician Card
```
┌─────────────────────────────────┐
│ [Photo]                         │
│ ★ 4.8  •  Band  •  Kuala Lumpur │
│ Ahmad & The Crew                │
│ From RM 500/event               │
└─────────────────────────────────┘
```

### Booking Card
```
┌─────────────────────────────────┐
│ [Status Badge: Confirmed]       │
│ Ahmad & The Crew                │
│ 📅 15 Feb 2026, 7:00 PM         │
│ 📍 Dewan Serbaguna, PJ          │
│ RM 1,500                        │
└─────────────────────────────────┘
```

### Stats Card
```
┌─────────────────────────────────┐
│ RM 12,500                       │
│ Total Earnings                  │
│ ↑ 15% from last month           │
└─────────────────────────────────┘
```

---

## Typography

- **Headings**: System font, Bold, 24-32px
- **Subheadings**: System font, Semibold, 18-20px
- **Body**: System font, Regular, 16px
- **Caption**: System font, Regular, 14px
- **Small**: System font, Regular, 12px

---

## Spacing & Layout

- **Screen padding**: 16px horizontal
- **Card padding**: 16px
- **Card border radius**: 12px
- **Button border radius**: 8px (standard), 24px (pill)
- **Spacing between sections**: 24px
- **Spacing between items**: 12px
