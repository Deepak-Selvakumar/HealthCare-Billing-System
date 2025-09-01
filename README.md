# HealthCare Billing System

A comprehensive Angular-based web application designed to streamline medical billing and patient management processes for healthcare providers.
 
## ✨ Key Features

### 🏥 Patient Management
- **Complete Patient Profiles** - Store detailed patient information including personal details, medical history, and contact information
- **CRUD Operations** - Create, read, update, and delete patient records with full validation
- **Advanced Search** - Find patients using various search parameters and filters
- **Medical History Tracking** - Maintain comprehensive records of allergies and medical conditions

### 💰 Intelligent Billing System
- **Itemized Billing** - Create detailed bills with multiple line items, categories, and pricing
- **Automatic Calculations** - Real-time calculation of subtotals, taxes, discounts, and final amounts
- **Multiple Payment Methods** - Support for cash, card, insurance, and online payments
- **Bill Status Tracking** - Monitor bills as PENDING, PAID, or CANCELLED
- **PDF Generation** - Export professional bills as printable PDF documents

### 🔐 Security & Authentication
- **Role-based Access Control** - Different permissions for users and administrators
- **JWT Authentication** - Secure token-based authentication system
- **Route Protection** - Guards to prevent unauthorized access to sensitive areas
- **Data Validation** - Comprehensive client and server-side validation

### 📊 Dashboard & Analytics
- **Overview Statistics** - Quick insights into patient numbers, revenue, and pending bills
- **Visual Data Representation** - Charts and graphs for financial and operational metrics
- **Recent Activity Tracking** - Monitor latest transactions and patient registrations
- **Financial Reports** - Generate comprehensive financial reports

## 🛠️ Technical Stack

### Frontend Framework
- **Angular 15+** - Modern, component-based framework with TypeScript
- **Angular Material** - UI component library for consistent, responsive design
- **RxJS** - Reactive programming for handling asynchronous operations
- **Reactive Forms** - Robust form handling with validation

### Backend Integration
- **RESTful API** - Clean API design following REST principles
- **HTTP Interceptors** - Automatic token attachment and error handling
- **Service Layer** - Abstracted API communication for maintainability

### State Management
- **BehaviorSubject** - Reactive state management for user authentication
- **Local Storage** - Secure client-side storage for authentication tokens
- **Route Parameters** - Efficient data passing between components
