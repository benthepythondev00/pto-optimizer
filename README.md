# PTO Optimizer

> Maximize your vacation days by strategically planning PTO around holidays. Get more time off with less PTO used.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://pto-optimizer.pages.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Smart Optimization** - Finds the best days to take off around public holidays for maximum vacation efficiency
- **Multi-Country Support** - US, UK, Germany, Canada, Australia, France (more coming soon)
- **Visual Calendar** - See your optimized vacation periods at a glance
- **Privacy First** - All calculations run in your browser, no data stored
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## Live Demo

**[pto-optimizer.pages.dev](https://pto-optimizer.pages.dev)**

## Quick Start

### Option 1: Use the Cloud Version (Recommended)

Just visit [pto-optimizer.pages.dev](https://pto-optimizer.pages.dev) - no installation required.

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/benthepythondev00/pto-optimizer.git
cd pto-optimizer

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Option 3: Docker

```bash
# Clone and run with Docker
git clone https://github.com/benthepythondev00/pto-optimizer.git
cd pto-optimizer

docker-compose up -d

# Open http://localhost:3000
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [SvelteKit](https://kit.svelte.dev) + Svelte 5 | Frontend framework |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | Database (SQLite) |
| [Drizzle ORM](https://orm.drizzle.team) | Database ORM |
| [Cloudflare Pages](https://pages.cloudflare.com) | Hosting |
| [Stripe](https://stripe.com) | Payments |
| [Vitest](https://vitest.dev) | Unit testing |
| [Playwright](https://playwright.dev) | E2E testing |

## Project Structure

```
pto-optimizer/
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components (Calendar, Header, Footer, etc.)
│   │   ├── server/         # Server-side code (auth, stripe, db)
│   │   ├── stores/         # Svelte stores (usage tracking)
│   │   └── utils/          # Core algorithm (optimizer, holidays)
│   └── routes/             # SvelteKit pages and API routes
├── tests/                  # E2E tests (Playwright)
├── drizzle/                # Database migrations
├── static/                 # Static assets
├── docker-compose.yml      # Docker setup
└── wrangler.toml           # Cloudflare configuration
```

## How It Works

1. **Select your country** - Holidays are automatically loaded
2. **Enter your PTO days** - How many vacation days do you have?
3. **Choose the year** - Plan for current or future years
4. **Get optimized results** - See the best days to take off

The algorithm analyzes public holidays and finds adjacent weekends and bridging opportunities to maximize your time off while minimizing PTO usage.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with love for people who value their time off.
