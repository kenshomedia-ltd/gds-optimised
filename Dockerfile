# Dockerfile
# Multi-stage build for Next.js application with caching optimization

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY .npmrc* ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json* ./
COPY .npmrc* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_TOKEN
ARG NEXT_PUBLIC_SITE_ID
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_HOSTNAME
ARG NEXT_LANG
ARG NEXT_PUBLIC_MEILISEARCH_HOST
ARG NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
ARG NEXT_PUBLIC_MEILISEARCH_INDEX_NAME
ARG NEXT_PUBLIC_IMAGE_URL
ARG NEXT_PUBLIC_IMAGE_BUCKET
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_PASSWORD

# Set build-time environment variables
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_TOKEN=$NEXT_PUBLIC_API_TOKEN
ENV NEXT_PUBLIC_SITE_ID=$NEXT_PUBLIC_SITE_ID
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_HOSTNAME=$NEXT_PUBLIC_HOSTNAME
ENV NEXT_LANG=$NEXT_LANG
ENV NEXT_PUBLIC_MEILISEARCH_HOST=$NEXT_PUBLIC_MEILISEARCH_HOST
ENV NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=$NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
ENV NEXT_PUBLIC_MEILISEARCH_INDEX_NAME=$NEXT_PUBLIC_MEILISEARCH_INDEX_NAME
ENV NEXT_PUBLIC_IMAGE_URL=$NEXT_PUBLIC_IMAGE_URL
ENV NEXT_PUBLIC_IMAGE_BUCKET=$NEXT_PUBLIC_IMAGE_BUCKET
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=$REDIS_PORT
ENV REDIS_PASSWORD=$REDIS_PASSWORD

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]