import { AgentData } from "@/components/pipeline/agent-output/agent-output.types";

export const sampleAgents: AgentData[] = [
  {
    id: "agent-requirements",
    name: "Requirements Analyst",
    status: "stopped",
    timestamp: "2024-01-15T10:32:00Z",
    output: `# Requirements Analysis Complete

## Summary
After analyzing the project brief and stakeholder interviews, I've identified the following key requirements for the authentication system.

## Functional Requirements

### FR-1: User Registration
- Users must be able to register with email and password
- Email verification is **required** before account activation
- Password must meet complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
  - At least one special character

### FR-2: Login Flow
Users can authenticate via:
1. Email + password (traditional)
2. OAuth 2.0 providers (Google, GitHub)
3. Magic link (passwordless)

> **Note:** SSO/SAML integration is out of scope for v1 but should be architecturally planned for.

## Technical Constraints

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Session duration | 24 hours | Security policy |
| Token refresh | 15 minutes | Balance security/UX |
| Max login attempts | 5 per 15 min | Brute force protection |
| Password hash | bcrypt (12 rounds) | Industry standard |

## API Contract

\`\`\`typescript
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    verified: boolean;
  };
}

interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}
\`\`\`

## Database Schema

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Risk Assessment
- **High:** Token storage in localStorage (XSS vulnerability) → Use \`httpOnly\` cookies instead
- **Medium:** Rate limiting bypass via distributed IPs → Implement CAPTCHA after 3 failures
- **Low:** Email enumeration via registration → Return generic responses

---

*Analysis completed in 4.2 seconds. Confidence: 94%*`,
  },
  {
    id: "agent-designer",
    name: "Frontend Designer",
    status: "running",
    timestamp: "2024-01-15T10:34:00Z",
    output: `# UI Design Specifications

## Component Architecture

The login page follows our design system with these key components:

### Layout Structure
\`\`\`
LoginPage
├── AuthCard (centered container)
│   ├── BrandLogo
│   ├── WelcomeText
│   ├── LoginForm
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── RememberMeCheckbox
│   │   └── SubmitButton
│   ├── Divider ("or continue with")
│   ├── OAuthButtons
│   │   ├── GoogleButton
│   │   └── GitHubButton
│   └── FooterLinks
│       ├── ForgotPasswordLink
│       └── RegisterLink
└── BackgroundPattern
\`\`\`

## Color Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| \`--bg-primary\` | #ffffff | #12121a | Card background |
| \`--bg-secondary\` | #f8f9fa | #1a1a25 | Page background |
| \`--text-primary\` | #212529 | #f8f9fa | Headings |
| \`--text-secondary\` | #495057 | #d1d5db | Body text |
| \`--brand-primary\` | #0ea5e9 | #38bdf8 | CTA buttons, links |
| \`--border\` | #dee2e6 | #2a2a3a | Input borders |

## Spacing Scale

Following 4px base grid:
- \`xs\`: 4px
- \`sm\`: 8px
- \`md\`: 16px
- \`lg\`: 24px
- \`xl\`: 32px
- \`2xl\`: 48px

## Animation Specs

\`\`\`css
/* Form entrance */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-card {
  animation: slideUp 300ms ease-out;
}
\`\`\`

## Responsive Breakpoints

- **Mobile** (< 640px): Full-width card, stacked OAuth buttons
- **Tablet** (640-1024px): 440px card width
- **Desktop** (> 1024px): 480px card width with background pattern

## Accessibility Notes

- All inputs must have visible labels (not just placeholders)
- Focus ring: \`ring-2 ring-brand-500 ring-offset-2\`
- Error states: red border + icon + descriptive message
- Screen reader: live regions for form validation errors`,
  },
  {
    id: "agent-backend",
    name: "Backend Developer",
    status: "stopped",
    timestamp: "2024-01-15T10:36:00Z",
    output: `# Backend Implementation Report

## Endpoints Implemented

### POST /api/auth/register

\`\`\`python
@router.post("/auth/register")
async def register(request: RegisterRequest) -> AuthResponse:
    """Register a new user account."""
    # Validate email format
    if not validate_email(request.email):
        raise HTTPException(400, "Invalid email format")
    
    # Check for existing user
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(409, "Email already registered")
    
    # Hash password
    password_hash = bcrypt.hash(request.password, rounds=12)
    
    # Create user
    user = await db.users.insert_one({
        "email": request.email,
        "password_hash": password_hash,
        "name": request.name,
        "verified": False,
        "created_at": datetime.utcnow(),
    })
    
    # Send verification email
    await send_verification_email(request.email, user.id)
    
    # Generate tokens
    tokens = generate_token_pair(user.id)
    
    return AuthResponse(
        access_token=tokens.access,
        refresh_token=tokens.refresh,
        expires_in=900,
        user=UserDTO.from_model(user),
    )
\`\`\`

### POST /api/auth/login

\`\`\`python
@router.post("/auth/login")
async def login(request: LoginRequest) -> AuthResponse:
    """Authenticate user with email and password."""
    # Rate limiting check
    if await is_rate_limited(request.email):
        raise HTTPException(429, "Too many attempts. Try again later.")
    
    # Find user
    user = await db.users.find_one({"email": request.email})
    if not user or not bcrypt.verify(request.password, user.password_hash):
        await record_failed_attempt(request.email)
        raise HTTPException(401, "Invalid credentials")
    
    # Check MFA if enabled
    if user.mfa_enabled:
        if not request.mfa_code:
            return MFARequiredResponse(mfa_required=True)
        if not verify_totp(user.mfa_secret, request.mfa_code):
            raise HTTPException(401, "Invalid MFA code")
    
    # Generate session
    tokens = generate_token_pair(user.id)
    await create_session(user.id, tokens.refresh)
    
    return AuthResponse(
        access_token=tokens.access,
        refresh_token=tokens.refresh,
        expires_in=900,
        user=UserDTO.from_model(user),
    )
\`\`\`

## Middleware Added

\`\`\`json
{
  "middleware": [
    "rate_limiter",
    "cors",
    "request_id",
    "auth_context"
  ],
  "rate_limits": {
    "/auth/login": "5 per 15 minutes per IP",
    "/auth/register": "3 per hour per IP",
    "/auth/refresh": "30 per hour per user"
  }
}
\`\`\`

## Tests Written

- ✅ Registration with valid data (happy path)
- ✅ Registration with duplicate email (409)
- ✅ Registration with weak password (400)
- ✅ Login with valid credentials
- ✅ Login with invalid password (401)
- ✅ Login rate limiting after 5 attempts
- ✅ Token refresh flow
- ✅ MFA verification flow

**Coverage:** 94.2% (lines), 89.1% (branches)`,
  },
  {
    id: "agent-qa",
    name: "QA Verifier",
    status: "pending",
    timestamp: "",
    output: "",
  },
];
