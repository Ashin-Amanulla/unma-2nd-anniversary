# Quick Registration Component

## Overview

The `QuickRegistration` component is a simplified, streamlined registration form designed for quick event registration. It focuses on essential information only, making it perfect for users who want to register quickly without going through the full detailed registration process.

## Features

### 1. **Personal Details**

- Full Name
- Email Address (with OTP verification)
- Contact Number
- WhatsApp Number (optional)
- Country
- State/UT
- District
- Blood Group

### 2. **Event Attendance**

- Attendance confirmation checkbox
- Attendee counter with age groups:
  - Adults (18+ years)
  - Teens (12-18 years)
  - Children (6-11 years)
  - Toddlers (2-5 years)
- Food preference tracking (vegetarian/non-vegetarian)
- Event participation options
- Participation details

### 3. **Financial Contribution**

- Optional financial contribution
- Contribution amount input
- Payment status tracking

### 4. **Verification System**

- Email OTP verification (required)
- WhatsApp OTP verification (required if attending)
- Real-time verification status

### 5. **User Experience**

- Step-by-step form progression
- Progress indicators (desktop and mobile)
- Real-time validation
- Progress summary sidebar
- Responsive design
- Smooth animations with Framer Motion

## Usage

### Route

Access the component at: `/quick-registration`

### Component Import

```jsx
import QuickRegistration from "./components/registration/QuickRegistration";
```

### Basic Usage

```jsx
<QuickRegistration />
```

## Form Structure

The form follows a 4-step process:

1. **Personal Details** - Basic information and email verification
2. **Event Attendance** - Attendance confirmation and attendee details
3. **Financial Contribution** - Optional contribution setup
4. **Review & Submit** - Final review and submission

## Data Structure

The component submits data in the following format:

```javascript
{
  registrationType: "Other",
  name: "string",
  email: "string",
  contactNumber: "string",
  whatsappNumber: "string",
  country: "string",
  stateUT: "string",
  district: "string",
  bloodGroup: "string",
  isAttending: boolean,
  attendees: {
    adults: { veg: number, nonVeg: number },
    teens: { veg: number, nonVeg: number },
    children: { veg: number, nonVeg: number },
    toddlers: { veg: number, nonVeg: number }
  },
  eventParticipation: ["string"],
  participationDetails: "string",
  willContribute: boolean,
  contributionAmount: number,
  paymentStatus: "pending",
  formDataStructured: {
    verification: { ... },
    personalInfo: { ... },
    eventAttendance: { ... },
    financial: { ... }
  }
}
```

## Dependencies

- **React Hook Form** - Form state management
- **Zod** - Form validation
- **Framer Motion** - Animations
- **React Toastify** - Notifications
- **Tailwind CSS** - Styling

## Validation

The component uses Zod schemas for validation:

- `validatePersonalDetails()` - Step 1 validation
- `validateEventAttendance()` - Step 2 validation
- `validateFinancialContribution()` - Step 3 validation
- `validateQuickRegistration()` - Final validation

## API Integration

The component integrates with the existing `registrationsApi`:

- `registrationsApi.create()` - Submit registration
- `registrationsApi.sendOtp()` - Send OTP for verification
- `registrationsApi.verifyOtp()` - Verify OTP

## Styling

- Uses Tailwind CSS for responsive design
- Follows the existing design system
- Mobile-first approach
- Consistent with other registration forms

## Customization

### Adding New Fields

1. Add field to the form's `defaultValues`
2. Add validation to the Zod schema
3. Add UI component in the appropriate step
4. Update the submission payload

### Modifying Steps

1. Update the `steps` array
2. Add new case in `renderStep()`
3. Update navigation logic
4. Add step-specific validation

### Changing Validation Rules

1. Modify the Zod schema in `quickRegistrationForm.js`
2. Update validation function calls
3. Adjust error handling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Progressive enhancement

## Performance

- Lazy loading with React.lazy()
- Optimized re-renders with React Hook Form
- Efficient state management
- Minimal bundle size impact

## Security

- OTP verification for email and WhatsApp
- Input sanitization
- CSRF protection through API tokens
- Secure form submission

## Accessibility

- Proper form labels
- ARIA attributes
- Keyboard navigation
- Screen reader support
- High contrast design

## Testing

The component can be tested by:

1. Navigating to `/quick-registration`
2. Filling out each step
3. Verifying OTP functionality
4. Testing form submission
5. Checking responsive behavior

## Troubleshooting

### Common Issues

1. **OTP not sending**: Check email and phone number format
2. **Form not submitting**: Ensure all required fields are filled and verified
3. **Validation errors**: Check console for detailed error messages
4. **Mobile issues**: Test on different screen sizes

### Debug Mode

Enable console logging by checking the browser console for:

- Form validation errors
- API response details
- OTP verification status

## Future Enhancements

- Integration with payment gateways
- Social media login options
- Multi-language support
- Advanced analytics tracking
- Bulk registration options
- Integration with CRM systems
