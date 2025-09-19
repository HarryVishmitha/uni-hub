# Alert System Implementation

This document describes the alert notification system implemented for the admin dashboard.

## Overview

The alert system provides a way to display toast-style notifications in the top-right corner of the admin interface. It supports different types of alerts (success, error, warning, info) with appropriate styling and icons.

## Components Structure

1. **AlertContext**: Provides global state management for alerts
2. **AlertContainer**: Manages displaying multiple alerts
3. **Alert**: Individual alert component with type-specific styling
4. **useAdminAlerts**: Hook for easy access to alert functionality
5. **Flash Helper**: Backend support for triggering alerts from controllers

## Frontend Usage

Import the `useAdminAlerts` hook in any component:

```jsx
import { useAdminAlerts } from '@/Hooks/useAdminAlerts';

// Inside your component
const { success, error, warning, info } = useAdminAlerts();

// Display different types of alerts
success('Operation completed successfully!');
error('An error occurred.');
warning('This action may have consequences.');
info('System maintenance scheduled.');
```

## Backend Usage

Use the `Flash` helper class in controllers:

```php
use App\Support\Flash;

// Display different types of alerts
Flash::success('Record created successfully!');
Flash::error('Failed to update record.');
Flash::warning('Record has been deleted.');
Flash::info('Maintenance scheduled.');
```

## Demo

An example card component has been added to the admin dashboard to demonstrate all alert types. Click the buttons to see the different types of alerts in action.

## Documentation

For detailed documentation, see [Alert System Documentation](/docs/alert-system.md).