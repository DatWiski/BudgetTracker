# Subscription Management Feature

## Overview
Comprehensive subscription tracking system that allows users to manage their recurring subscriptions, track spending, and organize by categories. This is one of the core feature of the budget tracker.

## Feature Goals
- **Complete CRUD operations** - Create, read, update, delete subscriptions
- **Smart categorization** - Organize subscriptions by type and purpose
- **Spending analytics** - Track monthly costs and trends
- **Status management** - Active/inactive subscription states

## Implementation Status

### ✅ Currently Working
- **CRUD operations** - Add, edit, delete subscriptions
- **Category filtering** - Filter by predefined categories
- **Status filtering** - Active/inactive subscriptions
- **Sorting** - By name, price, next billing date
- **Monthly total calculation** - Shows total monthly spend
- **Form validation** - Required fields, error handling
- **Responsive UI** - Works on desktop/mobile
- **Data persistence** - PostgreSQL backend with Spring Boot
- **Caching** - TanStack Query for performance

### ❌ Missing/Not Implemented
- **Price history** - No tracking of price changes
- **Renewal reminders** - No notifications system
- **Export functionality** - No CSV/data export
- **Bulk operations** - No multi-select actions
- **Input length validation** - Frontend form lacks maxLength limits for subscription names and other text fields, allowing potentially problematic very long inputs

### 🚧 In Progress  
- **Subscription logos & autocomplete** - Smart logo system with popular service suggestions

## 🚧 Logo System Implementation Plan

https://simpleicons.org/ there are some logos svg's

### Backend Components
1. **PredefinedService Entity**
   - Database table for popular services with logos
   - Fields: name, logoUrl, category, aliases
   - No changes to existing Subscription model

2. **Service Search API**
   - `GET /api/services/search?q=netf&limit=10`
   - Real-time search with debounced frontend calls
   - Returns matching services with logo URLs

3. **Logo Storage**
   - Static files in `/public/logos/services/`
   - Generic fallback icon for unknown services
   - No category icons used as fallbacks

### Frontend Components
1. **Autocomplete Component** (`components/SubscriptionAutocomplete.tsx`)
   - Real-time search hitting backend API
   - Logo preview for matched services
   - Fallback to generic subscription icon for unknown services
   - Custom service creation for unmatched entries

2. **Logo Display System**
   - Replace category dots with service logos in subscription list
   - Consistent 32px sizing with fallback handling
   - Two-tier fallback: predefined service logo → generic subscription icon

### Implementation Strategy
- **Phase 1**: Create PredefinedService entity and migration
- **Phase 2**: Add service search API endpoint  
- **Phase 3**: Seed database with 50+ popular services
- **Phase 4**: Implement frontend autocomplete with API integration
- **Phase 5**: Update subscription list display with logos

### Logo Fallback Hierarchy
1. **Primary**: Predefined service logo (Netflix, Spotify, etc.)
2. **Fallback**: Generic subscription icon (for niche/local services)
3. **No category icons used** - clean binary approach

### Technical Details
- PredefinedService as lookup table, Subscription model unchanged
- Frontend matches subscription names to predefined services for logos
- Debounced search (300ms) to optimize API calls
- TanStack Query caching for performance
- Error handling with automatic fallback to generic icon

