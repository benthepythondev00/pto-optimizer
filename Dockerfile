# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including adapter-node for Docker)
RUN npm ci
RUN npm install @sveltejs/adapter-node

# Copy source code
COPY . .

# Use Node adapter for Docker build
COPY svelte.config.node.js svelte.config.js

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy built assets
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set ownership
RUN chown -R sveltekit:nodejs /app

USER sveltekit

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the server
CMD ["node", "build"]
