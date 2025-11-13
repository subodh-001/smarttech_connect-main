# Technician Onboarding Flow Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION/LOGIN                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Select Role?    │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐         ┌───────────────┐
        │ Regular User  │         │  Technician   │
        └───────────────┘         └───────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────┐     ┌──────────────────────────┐
    │ User Dashboard    │     │ Technician-Onboarding    │
    │ (Direct Access)   │     │ (Information Page)       │
    └───────────────────┘     └──────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │  Check: Already Technician?   │
                        └───────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼                               ▼
            ┌──────────────────────┐      ┌──────────────────────┐
            │ YES (Already Tech)   │      │ NO (New Applicant)   │
            │ Redirect to:          │      │ Show:                │
            │ /technician-dashboard│      │ - Onboarding Steps   │
            └──────────────────────┘      │ - Requirements       │
                                          │ - "Start Application"│
                                          └──────────────────────┘
                                                        │
                                                        ▼
                                          ┌─────────────────────────┐
                                          │ Click "Start Application"│
                                          └─────────────────────────┘
                                                        │
                                                        ▼
                                          ┌─────────────────────────┐
                                          │ User Registration Form  │
                                          │ (with role=technician)  │
                                          └─────────────────────────┘
                                                        │
                                                        ▼
                                          ┌─────────────────────────┐
                                          │ Complete Registration   │
                                          │ + OTP Verification      │
                                          └─────────────────────────┘
                                                        │
                                                        ▼
                                          ┌─────────────────────────┐
                                          │ Technician Dashboard    │
                                          │ (After Account Created) │
                                          └─────────────────────────┘
```

## Purpose of Technician-Onboarding Page:

```
┌─────────────────────────────────────────────────────────────┐
│  WHY TECHNICIAN-ONBOARDING EXISTS:                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. INFORMATION PAGE                                        │
│     └─> Explains onboarding process to new applicants      │
│     └─> Shows requirements (ID, experience, references)    │
│     └─> Marketing/informational purpose                     │
│                                                              │
│  2. REDIRECT LOGIC                                          │
│     └─> If user.role === 'technician'                      │
│         └─> Auto-redirects to /technician-dashboard        │
│     └─> If NOT technician                                    │
│         └─> Shows onboarding info + "Start Application"    │
│                                                              │
│  3. REGISTRATION ENTRY POINT                                 │
│     └─> "Start Application" button                          │
│         └─> Navigates to /user-registration                 │
│         └─> With state: { role: 'technician' }              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Current Flow Comparison:

```
┌──────────────────────────────────────────────────────────────┐
│  DIRECT SIGN-IN FLOW:                                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Login → Check Role → Technician Dashboard                   │
│    ✅ Works for EXISTING technicians                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ONBOARDING PAGE FLOW:                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Registration → Technician-Onboarding → Registration Form    │
│    ✅ Works for NEW technicians                              │
│    ✅ Provides information before registration                │
│    ✅ Redirects existing technicians automatically            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Summary:

```
┌─────────────────────────────────────────────────────────────┐
│  Technician-Onboarding is:                                   │
│                                                              │
│  • Informational landing page for NEW applicants            │
│  • Auto-redirects EXISTING technicians to dashboard         │
│  • Entry point for technician registration                  │
│  • NOT required for direct sign-in                          │
│                                                              │
│  Direct Sign-In:                                             │
│    → Goes straight to technician-dashboard                  │
│    → Bypasses onboarding page                               │
│                                                              │
│  New Registration:                                           │
│    → Shows onboarding info first                           │
│    → Then registration form                                 │
│    → Then dashboard                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

