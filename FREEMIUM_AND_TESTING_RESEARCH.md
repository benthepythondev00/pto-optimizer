# PTO Optimizer - Freemium & Testing Best Practices Research

## Part 1: Freemium Conversion Best Practices

### Industry Benchmarks (2024-2025)

| Metric | Average | Top Performers |
|--------|---------|----------------|
| Visitor to Freemium | 12-15% | 20%+ |
| Freemium to Paid | 2-5% | 10-30% (Slack, Spotify) |
| Free Trial to Paid (Opt-in) | 17.8% | 25%+ |
| Free Trial to Paid (Opt-out) | 49.9% | 60%+ |

**Key Insight**: Traditional freemium converts at 3.7%, but with the right strategies you can reach 10-30%.

---

### Best Freemium Conversion Strategies

#### 1. Usage Limits (RECOMMENDED for PTO Optimizer)
**How it works**: Give full features but limit usage quantity.

**Examples**:
- Loom: 5-minute video limit on free
- Zapier: 100 tasks/month, 5 Zaps
- Notion: Limited blocks

**For PTO Optimizer**:
```
FREE:
- 3 optimizations per month
- 1 country only
- Current year only
- No export/calendar sync

PRO ($4.99/mo):
- Unlimited optimizations
- All 6 countries
- Multi-year planning
- Export to calendar (ICS)
- Save & compare scenarios
```

#### 2. Feature Gating
**How it works**: Core features free, advanced features paid.

**For PTO Optimizer**:
```
FREE FEATURES:
- Basic optimization algorithm
- View results on screen
- 1 country

PREMIUM FEATURES:
- Calendar sync (Google, Outlook)
- Export to PDF/ICS
- Email reminders before PTO
- Team sharing (future)
- Custom holidays
- Multi-year comparison
```

#### 3. FOMO (Fear of Missing Out)
**How it works**: Show users what they're missing.

**Implementation**:
- Show blurred premium features
- Display "X more vacation days possible with Pro"
- Show locked calendar export button

#### 4. Contextual Upgrade Prompts
**How it works**: Prompt upgrade when user hits a limit or needs a feature.

**Trigger Points**:
- After 3rd optimization: "You've used all free optimizations this month"
- When clicking export: "Export to calendar is a Pro feature"
- When selecting 2nd country: "Multiple countries available with Pro"

#### 5. Reverse Trial (OPTIONAL - Consider for v2)
**How it works**: Give full Pro access for 7-14 days, then downgrade to free.

**Pros**: Users experience full value
**Cons**: More complex to implement

---

### Recommended Pricing for PTO Optimizer

#### Tier Structure

| Tier | Price | Best For |
|------|-------|----------|
| **Free** | $0 | Try before buy, self-hosters |
| **Pro Monthly** | $4.99/mo | Casual users |
| **Pro Annual** | $39/year (35% off) | Committed users |

**Why $4.99**:
- Impulse buy territory (under $5)
- Similar tools charge $5-15/mo
- Annual discount encourages commitment
- Low enough that churn doesn't hurt

#### Usage Limits Detail

```
FREE TIER:
├── 3 optimizations/month (resets monthly)
├── 1 country (US default)
├── Current year only
├── View results only (no export)
└── Basic support (community)

PRO TIER:
├── Unlimited optimizations
├── All 6 countries
├── 3 years planning (current + 2 future)
├── Export: PDF, ICS, Google Calendar
├── Save scenarios (up to 10)
├── Email reminders
└── Priority support
```

---

### Conversion Funnel Optimization

#### Key Metrics to Track
1. **Visitor → Free User** (target: 15%+)
2. **Free User → Active User** (used 1+ optimization)
3. **Active User → Hit Limit** (used 3 optimizations)
4. **Hit Limit → Upgrade Prompt Seen**
5. **Prompt Seen → Upgrade** (target: 5-10%)

#### Upgrade Prompt Best Practices

1. **Timing**: Show prompt AFTER user gets value, not before
2. **Context**: Explain what they'll get, not what they're losing
3. **Urgency**: "Upgrade now and plan your entire year"
4. **Social Proof**: "Join 1,000+ users who maximize their vacation"
5. **Easy Exit**: Always allow dismissing the prompt

---

## Part 2: Testing Best Practices for SvelteKit

### Testing Strategy: Client-Server Alignment

```
┌─────────────────────────────────────────────────────────┐
│                    Testing Pyramid                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    ▲ E2E Tests                          │
│                   ▲▲▲ (Playwright)                      │
│                  ▲▲▲▲▲ Full user flows                  │
│                                                          │
│              ▲▲▲▲▲▲▲▲▲ Integration Tests               │
│             ▲▲▲▲▲▲▲▲▲▲▲ (Component + State)            │
│                                                          │
│        ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ Unit Tests                   │
│       ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ (Vitest)                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Recommended Test Stack

```json
{
  "devDependencies": {
    "@vitest/browser": "^3.x",
    "vitest-browser-svelte": "^0.1.x",
    "playwright": "^1.52.x",
    "@playwright/test": "^1.52.x",
    "vitest": "^3.x"
  }
}
```

### Test File Naming Convention

```
src/
├── lib/
│   ├── components/
│   │   ├── Button.svelte
│   │   ├── Button.svelte.test.ts    # Client/browser tests
│   │   └── Button.ssr.test.ts       # SSR tests
│   ├── utils/
│   │   ├── optimizer.ts
│   │   └── optimizer.test.ts        # Unit tests (Node)
│   └── server/
│       ├── api.ts
│       └── api.test.ts              # Server tests
├── routes/
│   ├── +page.svelte
│   └── +page.svelte.test.ts         # Page component tests
tests/
├── e2e/
│   ├── optimization.spec.ts         # E2E user flows
│   └── upgrade.spec.ts              # Payment flow tests
```

### Vitest Configuration

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        // Client-side tests (Svelte components)
        extends: './vite.config.ts',
        test: {
          name: 'client',
          environment: 'browser',
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          setupFiles: ['./vitest-setup-client.ts'],
        },
      },
      {
        // Server-side tests
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:client": "vitest --project=client",
    "test:server": "vitest --project=server",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage"
  }
}
```

### Key Testing Patterns

#### 1. Component Testing (Browser)
```typescript
import { page } from '@vitest/browser/context'
import { render } from 'vitest-browser-svelte'
import MyComponent from './MyComponent.svelte'

it('renders correctly', async () => {
  render(MyComponent, { props: { value: 'test' } })
  
  const element = page.getByRole('button')
  await expect.element(element).toBeInTheDocument()
})
```

#### 2. Always Use Locators (NOT containers)
```typescript
// ❌ BAD - No auto-retry, flaky
const { container } = render(MyComponent)
const button = container.querySelector('button')

// ✅ GOOD - Auto-retry built in
render(MyComponent)
const button = page.getByRole('button')
await expect.element(button).toBeInTheDocument()
```

#### 3. Locator Priority
```typescript
// Best to worst:
page.getByRole('button', { name: 'Submit' })  // 1. Semantic roles
page.getByLabel('Email')                       // 2. Labels
page.getByText('Welcome')                      // 3. Text content
page.getByTestId('submit-btn')                 // 4. Test IDs (last resort)
```

#### 4. E2E Testing (Playwright)
```typescript
// tests/e2e/optimization.spec.ts
import { test, expect } from '@playwright/test'

test('user can optimize PTO', async ({ page }) => {
  await page.goto('/')
  
  // Select country
  await page.selectOption('[data-testid="country-select"]', 'US')
  
  // Set PTO days
  await page.fill('[data-testid="pto-input"]', '15')
  
  // Check results appear
  await expect(page.getByText('Recommended Vacation Periods')).toBeVisible()
})
```

### What to Test

#### High Priority (Must Test)
- [ ] Optimization algorithm correctness
- [ ] Usage limit enforcement
- [ ] Upgrade prompts appear at right time
- [ ] Payment flow (when implemented)
- [ ] Country/holiday data accuracy

#### Medium Priority
- [ ] Calendar export functionality
- [ ] Form validations
- [ ] Error states
- [ ] Mobile responsiveness

#### Low Priority (Nice to Have)
- [ ] Animations
- [ ] CSS styling details
- [ ] Third-party integrations

---

## Part 3: Implementation Plan

### Phase 1: Core Freemium (This Sprint)

1. **Create usage tracking store** (`src/lib/stores/usage.svelte.ts`)
   - Track optimizations count
   - Store in localStorage
   - Reset monthly

2. **Create upgrade modal component** (`src/lib/components/UpgradeModal.svelte`)
   - Show when limit hit
   - Highlight Pro benefits
   - Link to payment (placeholder)

3. **Add usage limit checks** in main page
   - Check before optimization
   - Show remaining count
   - Trigger modal at limit

4. **Add premium feature indicators**
   - Lock icons on premium features
   - Tooltips explaining Pro benefits

### Phase 2: Payment Integration (Next Sprint)

1. Set up Lemon Squeezy account
2. Create products (Pro Monthly, Pro Annual)
3. Implement webhook handler
4. Add subscription status to user store
5. Gate features based on subscription

### Phase 3: Testing (Ongoing)

1. Set up Vitest with browser mode
2. Write component tests
3. Write E2E tests for critical flows
4. Add to CI/CD pipeline

---

## Resources

- [Userpilot Freemium Guide](https://userpilot.com/blog/freemium-conversion-rate/)
- [First Page Sage Benchmarks](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [vitest-browser-svelte](https://github.com/vitest-dev/vitest-browser-svelte)
- [Playwright Docs](https://playwright.dev/)
- [sveltest.dev](https://sveltest.dev) - SvelteKit testing patterns
