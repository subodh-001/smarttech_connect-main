import HelpArticle from '../models/HelpArticle.js';

const baseArticles = [
  {
    title: 'How to create your SmartTech Connect account',
    slug: 'getting-started-create-account',
    summary: 'Step-by-step guide to create and verify your SmartTech Connect account in minutes.',
    category: 'getting-started',
    estimatedReadMinutes: 3,
    audience: ['all'],
    tags: ['registration', 'account'],
    keywords: ['signup', 'register', 'account creation'],
    contentSections: [
      {
        heading: 'Create your account',
        body: 'Visit the registration page and choose whether you are a customer or a technician. Provide your name, email address, and a secure password that meets the password policy.',
        bullets: [
          'Open the SmartTech Connect app or website',
          'Select “Create an account”',
          'Enter your full name, email address, and password',
        ],
        icon: 'UserPlus',
      },
      {
        heading: 'Verify your email address',
        body: 'We send a six-digit verification code to the registered email. Enter the code within 5 minutes to verify your email and continue.',
        bullets: ['Check your inbox for the verification email', 'Enter the code on the verification screen'],
        icon: 'MailCheck',
      },
      {
        heading: 'Complete your profile',
        body: 'After verification, update your profile details including contact number, service address, and preferred language to receive personalised notifications.',
        bullets: ['Add your phone number', 'Provide your service location', 'Set notification preferences'],
        icon: 'ClipboardList',
      },
    ],
  },
  {
    title: 'Tracking and managing your service requests',
    slug: 'booking-manage-service-requests',
    summary: 'Understand the different stages of a booking and learn how to reschedule, cancel, or communicate with your technician.',
    category: 'booking-services',
    estimatedReadMinutes: 4,
    audience: ['user'],
    tags: ['bookings', 'requests'],
    keywords: ['service request', 'booking status', 'reschedule'],
    contentSections: [
      {
        heading: 'Monitor booking status',
        body: 'Each booking passes through stages such as pending, confirmed, in-progress, and completed. You can view the live status from the dashboard.',
        bullets: [
          'Open the user dashboard',
          'Locate the booking under Active Services',
          'Review the current status and technician details',
        ],
        icon: 'Activity',
      },
      {
        heading: 'Reschedule or cancel requests',
        body: 'Need to make changes? Use the booking detail screen to reschedule to a new time or cancel the request if the technician has not yet started.',
        bullets: ['Open the booking details', 'Choose “Reschedule” or “Cancel”', 'Select a new slot or confirm cancellation'],
        icon: 'CalendarClock',
      },
      {
        heading: 'Chat with your technician',
        body: 'Use the in-app chat for quick clarifications or to share additional details. Communication history stays attached to the booking for reference.',
        bullets: ['Tap “Chat with technician” from the booking screen', 'Send real-time messages and photos if required'],
        icon: 'MessageCircle',
      },
    ],
  },
  {
    title: 'Updating account details and notification settings',
    slug: 'account-manage-profile-settings',
    summary: 'Keep your account information up to date and control how you receive alerts for new jobs, bookings, and updates.',
    category: 'account-settings',
    estimatedReadMinutes: 3,
    audience: ['all'],
    tags: ['profile', 'settings'],
    keywords: ['profile update', 'notification preferences'],
    contentSections: [
      {
        heading: 'Edit personal information',
        body: 'From the profile page you can edit full name, contact number, and address. Technicians can also update their bio and service radius.',
        icon: 'Edit3',
      },
      {
        heading: 'Manage notification preferences',
        body: 'Choose which alerts you receive through email, SMS, or push notifications. Customers can enable appointment reminders, while technicians can enable new job alerts.',
        bullets: ['Open Settings > Notifications', 'Toggle email, SMS, and push notifications', 'Save your preferences'],
        icon: 'Bell',
      },
      {
        heading: 'Secure your account',
        body: 'Update your password regularly and enable multi-factor verification for improved security.',
        bullets: ['Go to Settings > Security', 'Update password following the strength indicator', 'Enable OTP verification during login'],
        icon: 'ShieldCheck',
      },
    ],
  },
  {
    title: 'Understanding invoices and payment schedules',
    slug: 'billing-payments-overview',
    summary: 'A quick overview of how billing works for customers and payout timelines for technicians.',
    category: 'billing',
    estimatedReadMinutes: 4,
    audience: ['all'],
    tags: ['billing', 'payments'],
    keywords: ['invoice', 'payment', 'payout'],
    contentSections: [
      {
        heading: 'Customer billing cycle',
        body: 'Customers receive a detailed invoice once a job is completed. You can download invoices from the booking history for accounting purposes.',
        bullets: ['Open the completed booking', 'Click “Download invoice”', 'Review charges and taxes applied'],
        icon: 'FileText',
      },
      {
        heading: 'Technician payouts',
        body: 'Technician earnings are processed every Friday. Ensure your bank details are verified under Technician Settings to avoid payout delays.',
        bullets: ['Check payout summary from the technician dashboard', 'Update bank details under Financial Settings'],
        icon: 'Wallet',
      },
      {
        heading: 'Payment support',
        body: 'If you encounter billing discrepancies, raise a support ticket with the invoice number for faster resolution.',
        bullets: ['Go to Help Center > Contact Support', 'Choose “Billing & Payments” category', 'Share invoice reference and issue summary'],
        icon: 'LifeBuoy',
      },
    ],
  },
  {
    title: 'Keeping your account secure',
    slug: 'privacy-security-best-practices',
    summary: 'Best practices for securing your SmartTech Connect account and protecting customer data.',
    category: 'privacy-security',
    estimatedReadMinutes: 3,
    audience: ['all'],
    tags: ['security', 'privacy'],
    keywords: ['security', 'privacy', 'account protection'],
    contentSections: [
      {
        heading: 'Use strong authentication',
        body: 'Always use a strong password and enable OTP verification for critical actions such as payouts or profile changes.',
        icon: 'Lock',
      },
      {
        heading: 'Recognise suspicious activity',
        body: 'SmartTech Connect flags unusual login attempts. If you receive an alert, reset your password immediately and contact support.',
        bullets: ['Watch out for unexpected device login alerts', 'Reset password from the Security section', 'Contact support if you suspect a breach'],
        icon: 'AlertTriangle',
      },
      {
        heading: 'Protect customer data',
        body: 'Technicians should never share customer details outside the platform. Use in-app chat and avoid storing customer information on personal devices.',
        icon: 'Shield',
      },
    ],
  },
  {
    title: 'Resolving common technician app issues',
    slug: 'troubleshooting-technician-app-issues',
    summary: 'Quick fixes for location tracking, job notifications, and KYC submission errors in the technician app.',
    category: 'troubleshooting',
    estimatedReadMinutes: 5,
    audience: ['technician'],
    tags: ['technician', 'debug'],
    keywords: ['troubleshooting', 'technician app', 'location'],
    contentSections: [
      {
        heading: 'Enable background location',
        body: 'Ensure location permissions are set to “Always allow” so customers see real-time updates when a job is in progress.',
        bullets: ['Open device settings', 'Set SmartTech Connect location permission to “Always”', 'Toggle “Share live location” inside the app'],
        icon: 'MapPin',
      },
      {
        heading: 'Receive job notifications',
        body: 'Confirm notification permissions are enabled and you are marked as Available on the technician dashboard.',
        bullets: ['Go to Technician Dashboard > Status', 'Switch to “Go Online”', 'Enable push notifications under Settings'],
        icon: 'BellRing',
      },
      {
        heading: 'Fix KYC upload issues',
        body: 'Compress high-resolution images under 5 MB and ensure files are in JPG, PNG, or PDF format before uploading.',
        icon: 'FileWarning',
      },
    ],
  },
];

export const ensureHelpCenterSeed = async () => {
  const existingCount = await HelpArticle.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await HelpArticle.insertMany(
    baseArticles.map((article) => ({
      ...article,
      published: true,
      featured: true,
    }))
  );

  console.log('[seed] Help center articles inserted');
};

export default ensureHelpCenterSeed;

