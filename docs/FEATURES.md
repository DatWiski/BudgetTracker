# Budget Tracker - Features

## 🎯 Core Features (Implemented)

### 📱 Subscription Management
- **CRUD operations** - Add, edit, delete subscriptions
- **Category filtering** - Filter by predefined categories (Entertainment, Utilities, etc.)
- **Status filtering** - Active/inactive subscriptions
- **Sorting** - By name, price, next billing date
- **Monthly total calculation** - Shows total monthly spend
- **Form validation** - Required fields, error handling
- **Next billing calculation** - Automatic date calculations for recurring periods

### 💰 Income Tracking  
- **Income entry** - Manual income recording with categories
- **Category support** - Salary, freelance, investments, etc.
- **Monthly analytics** - Track income trends and totals
- **Date-based filtering** - View income by time periods

### 📊 Dashboard & Analytics
- **Financial overview** - Income vs expenses comparison
- **Monthly trends** - Charts showing spending patterns
- **Category breakdowns** - Visual spending distribution
- **Real-time updates** - Live data refresh
- **Interactive charts** - Clickable visualizations

### 🔐 Authentication
- **Google OAuth2** - Single sign-on authentication
- **JWT tokens** - Stateless authentication with auto-refresh
- **Persistent sessions** - Users stay logged in across server restarts
- **Secure token management** - RSA-signed JWT with key persistence

## 📋 Planned Features

### 📋 Bills Management
- **Non-subscription bills** - One-time and irregular recurring bills
- **Payment tracking** - Mark bills as paid/unpaid
- **Due date reminders** - Upcoming bill notifications
- **Payment history** - Track payment patterns

### 📈 Advanced Analytics
- **Budget goals** - Set spending limits and track progress
- **Data export** - CSV/PDF export of financial data
- **Category insights** - Detailed spending analysis per category
- **Trend predictions** - Forecast future spending patterns

### 🔔 Notifications
- **Email alerts** - Bill due dates and spending limits
- **Push notifications** - Real-time spending alerts
- **Custom thresholds** - User-defined notification triggers

### 🎨 Customization
- **Themes** - Light/dark mode and custom color schemes
- **Multi-currency** - Support for different currencies
- **Dashboard widgets** - Customizable dashboard layout
- **Personal categories** - User-defined spending categories

### 🔗 Integrations
- **Bank sync** - Automatic transaction import
- **Calendar integration** - Bill due dates in calendar
- **Mobile apps** - iOS/Android applications
- **API access** - Third-party integrations

### 🏢 Enterprise Features
- **Multi-user support** - Family/team budget management
- **Role-based access** - Admin, viewer, editor permissions
- **Audit logs** - Track all financial changes
- **Advanced reporting** - Business-grade analytics

## 📊 Technical Architecture
- **Frontend**: React 19 + TypeScript, TailwindCSS, TanStack Query
- **Backend**: Spring Boot 3.5.3, Spring Security, PostgreSQL
- **Authentication**: OAuth2 + JWT with auto-refresh
- **Deployment**: Single JAR with embedded frontend

## 🚀 Current Status
The application has a solid foundation with core subscription management, income tracking, and dashboard analytics implemented. JWT authentication provides a secure, scalable auth system. Ready for additional feature development.