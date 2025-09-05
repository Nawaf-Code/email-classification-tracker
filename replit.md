# Employee Management System

## Overview

This is an Arabic RTL Flask web application designed for Saudi government organizations to manage employee data and email analytics. The system features a clean, accessible interface with three main pages: login, dashboard, and employee CRUD operations. The application uses in-memory data storage for MVP functionality and includes interactive charts for data visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap RTL for responsive design
- **Styling**: Custom CSS variables implementing Saudi government color palette (greens and neutrals)
- **Typography**: Google Fonts "Tajawal" with Arabic font fallbacks
- **JavaScript**: Vanilla JS for client-side functionality, Chart.js for data visualization
- **Responsiveness**: Bootstrap-based responsive grid system optimized for RTL layout

### Backend Architecture
- **Framework**: Flask with session-based authentication
- **Data Storage**: In-memory Python lists and dictionaries for MVP (no database dependency)
- **Routing Structure**: 
  - Static routes for page rendering
  - API endpoints for data operations (`/api/employees`, `/api/toggle`)
- **Authentication**: Simple credential matching with session management
- **Localization**: Full Arabic RTL support with proper text direction and alignment

### Core Features
- **Employee Management**: Full CRUD operations with client-side filtering and pagination
- **Dashboard Analytics**: Email category statistics with pie and bar charts
- **Search & Filter**: Client-side search by name/email and filtering by department/working days
- **Settings Management**: System toggle functionality with server communication

### Data Model
- **Employee Schema**: ID, name, email, department, working days (boolean flags), shift, performance metrics
- **Email Categories**: Organization, Lab, Request, Other with count tracking
- **Department Statistics**: Automated aggregation for chart visualization

## External Dependencies

### CDN Resources
- **Bootstrap 5.3.0 RTL**: CSS framework for responsive layout
- **Chart.js**: Interactive charts for dashboard analytics
- **Font Awesome 6.0.0**: Icon library for UI elements
- **Google Fonts Tajawal**: Arabic typography

### Python Dependencies
- **Flask**: Web framework and templating
- **Standard Library**: os, logging for configuration and debugging

### Browser Requirements
- Modern browsers with ES6+ support for vanilla JavaScript functionality
- RTL text rendering support for proper Arabic display