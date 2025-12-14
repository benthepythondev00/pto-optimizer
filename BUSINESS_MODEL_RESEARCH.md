# PTO Optimizer - Business Model & Payment Research

## Business Model: Open Core / Self-Hosted + Cloud SaaS (like n8n)

### Overview
- **Self-hosted**: Free, open source (MIT/AGPL), users run it themselves
- **Cloud hosted**: Paid subscription, you handle hosting & maintenance

---

## Payment Provider Comparison

### 1. Lemon Squeezy (RECOMMENDED for starting)

**Pros:**
- Merchant of Record (MoR) - handles ALL tax compliance globally (VAT, sales tax)
- No monthly fees - only pay when you make sales
- Perfect for indie developers and small SaaS
- Beautiful checkout UI, no-code integration
- License key management built-in
- Subscription management (upgrades, downgrades, trials)
- Fraud protection included
- Now owned by Stripe (stability)

**Pricing:**
- 5% + $0.50 per transaction
- No monthly fee
- All features included

**Best for:** Starting out, solo developers, < $50k/year revenue

---

### 2. Stripe (Direct)

**Pros:**
- Industry standard, trusted
- Lowest fees at scale
- Full control and customization
- Excellent API and docs

**Cons:**
- YOU handle tax compliance (need additional service like TaxJar)
- More development work required
- Need to manage fraud, chargebacks yourself

**Pricing:**
- 2.9% + $0.30 per transaction
- + Tax compliance costs ($50-500/month with TaxJar/Avalara)

**Best for:** > $100k revenue, technical teams, need full control

---

### 3. Paddle

**Pros:**
- Merchant of Record (handles taxes)
- Good for established SaaS
- Enterprise features

**Cons:**
- Higher fees than Lemon Squeezy
- Less indie-friendly
- Slower approval process

**Pricing:**
- 5% + $0.50 per transaction (similar to Lemon Squeezy)

**Best for:** Established SaaS with $50k+ revenue

---

## RECOMMENDATION: Start with Lemon Squeezy

**Why:**
1. Zero upfront cost - only pay when you earn
2. Tax compliance handled automatically (crucial for global SaaS)
3. Perfect for subscription billing
4. Easy integration with SvelteKit
5. Can migrate to Stripe later if needed at scale

---

## Pricing Strategy for PTO Optimizer

### Competitive Analysis

Similar tools pricing:
- Most PTO/vacation planners are free or $5-10/month
- Productivity SaaS typically: $5-15/month for individuals, $15-50/month for teams

### Recommended Pricing Tiers

#### Option A: Simple Freemium (RECOMMENDED TO START)

| Tier | Price | Features |
|------|-------|----------|
| **Free (Self-hosted)** | $0 | Full features, self-host on own server |
| **Free Cloud** | $0 | 1 optimization/month, 1 country |
| **Pro** | $4.99/month or $39/year | Unlimited optimizations, all countries, save & export, calendar sync |

**Why this works:**
- Low price point = impulse buy
- Annual discount encourages commitment
- Self-hosted option for Reddit marketing (r/selfhosted)

---

#### Option B: Usage-Based (Alternative)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 optimizations/month |
| **Pay-as-you-go** | $0.99/optimization | Single use |
| **Unlimited** | $29/year | Unlimited everything |

---

#### Option C: Team Pricing (Future)

| Tier | Price | Features |
|------|-------|----------|
| **Individual** | $4.99/mo | 1 user |
| **Team** | $9.99/mo | Up to 10 users, shared calendars |
| **Business** | $29.99/mo | Unlimited users, SSO, admin dashboard |

---

## Implementation Plan

### Phase 1: MVP (Now)
1. Build the app (in progress)
2. Free cloud version with usage limits
3. Self-hosted Docker option
4. No payments yet - validate product-market fit

### Phase 2: Monetization (After 100+ users)
1. Integrate Lemon Squeezy
2. Add Pro tier with subscription
3. Implement usage tracking

### Phase 3: Scale (After $1k MRR)
1. Evaluate if Stripe direct makes sense
2. Add team features
3. Consider enterprise tier

---

## Lemon Squeezy Integration Notes

### SvelteKit Integration
```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

### Webhook Flow
1. User clicks "Upgrade to Pro"
2. Redirect to Lemon Squeezy checkout
3. Lemon Squeezy handles payment + tax
4. Webhook notifies your app
5. Update user subscription status in D1

### Required Endpoints
- `POST /api/webhooks/lemonsqueezy` - Handle subscription events
- `GET /api/subscription/status` - Check user subscription
- `POST /api/subscription/portal` - Customer portal redirect

---

## Key Takeaways

1. **Start free** - Build audience before monetizing
2. **Use Lemon Squeezy** - Zero upfront cost, handles tax headaches
3. **Price low** - $4.99/mo is impulse buy territory
4. **Annual discount** - Offer 35% off for yearly ($39 vs $60)
5. **Self-hosted option** - Great for Reddit marketing & trust building
6. **Migrate later** - Can switch to Stripe when at scale

---

## Resources

- Lemon Squeezy Docs: https://docs.lemonsqueezy.com
- Lemon Squeezy SvelteKit Guide: https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments
- n8n Pricing Model: https://n8n.io/pricing
