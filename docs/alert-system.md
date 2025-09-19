# Alert System Documentation

The UniHub alert system provides a flexible way to display notifications to users. It supports multiple alert types with automatic styling and optional auto-dismissal.

## Using Alerts in React Components

### Basic React Usage

```jsx
import { useAdminAlerts } from '@/Hooks/useAdminAlerts';

function MyComponent() {
  const { success, error, warning, info } = useAdminAlerts();
  
  // Show a success alert
  const handleSuccess = () => {
    success('Operation completed successfully!');
  };
  
  // Show an error alert (doesn't auto-dismiss by default)
  const handleError = () => {
    error('An error occurred.');
  };
  
  // Show a warning alert
  const handleWarning = () => {
    warning('This action may have consequences.');
  };
  
  // Show an info alert
  const handleInfo = () => {
    info('The system will undergo maintenance tomorrow.');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Advanced Options

Each alert function accepts an optional second parameter for additional configuration:

```jsx
// Show a success alert that doesn't auto-dismiss
success('Success message', { timeout: 0 });

// Show an error alert with a custom timeout (in milliseconds)
error('Error message', { timeout: 10000 });
```

## Using Alerts from Controllers (Backend)

The system includes a `Flash` helper class that allows you to trigger alerts from your Laravel controllers.

### Controller Usage

```php
use App\Support\Flash;

class ExampleController extends Controller
{
    public function store()
    {
        // Process form...
        
        // Show a success message
        Flash::success('Record created successfully!');
        
        return redirect()->back();
    }
    
    public function update()
    {
        try {
            // Process update...
            Flash::success('Record updated successfully!');
        } catch (\Exception $e) {
            Flash::error('Failed to update record: ' . $e->getMessage());
        }
        
        return redirect()->back();
    }
    
    public function delete()
    {
        // Process deletion...
        
        Flash::warning('Record has been permanently deleted.');
        
        return redirect()->route('records.index');
    }
    
    public function maintenance()
    {
        Flash::info('The system will be under maintenance from 10PM to 2AM.');
        
        return redirect()->back();
    }
}
```

## Alert Types

The system supports four alert types, each with appropriate styling:

1. **Success** (`success`) - Green styling, check icon
2. **Error** (`error`) - Red styling, alert circle icon
3. **Warning** (`warning`) - Amber styling, alert triangle icon
4. **Info** (`info`) - Blue styling, info icon

## Timeout Behavior

- **Success alerts**: Auto-dismiss after 5 seconds
- **Error alerts**: Do not auto-dismiss (requires user action)
- **Warning alerts**: Auto-dismiss after 7 seconds
- **Info alerts**: Auto-dismiss after 5 seconds

You can override these defaults by providing a custom `timeout` value in milliseconds. Use `0` to disable auto-dismiss.

## Enhanced Features

The alert system now includes several advanced features:

### Timeout Indicator

Alerts with auto-dismiss show a countdown timer and progress bar indicating when they will disappear.

### Animated Transitions

Alerts animate in from the right side of the screen and animate out when dismissed.

### Improved Contrast

Alert backgrounds now use higher contrast colors to stand out better from the page content.

### Custom Shadow Effects

Each alert type has a custom shadow that matches its color scheme.

## Example Demo

The Admin Dashboard includes an example card demonstrating all alert types. Use it to see how different alerts look and behave in the application. The demo also allows you to adjust the timeout duration to see how the countdown indicator works.

## Contact and Help

For questions or issues related to the alert system, please contact the development team.

## Support

For questions or issues related to the alert system, please contact the development team.