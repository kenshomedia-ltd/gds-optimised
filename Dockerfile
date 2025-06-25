# Dockerfile
# Optimized multi-stage build for a Next.js standalone application

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY .npmrc* ./

# Install dependencies with cache mount
# --- MODIFIED LINE ---
RUN --mount=type=cache,target=/root/.npm sh -c "npm cache verify && npm ci --only=production"

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json* ./
COPY .npmrc* ./
# --- MODIFIED LINE ---
RUN --mount=type=cache,target=/root/.npm sh -c "npm cache verify && npm ci"

# Copy source code
COPY . .

# Build arguments for PUBLIC environment variables needed by 'npm run build'
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
ARG NEXT_PUBLIC_GAMES_API_URL
ARG NEXT_PUBLIC_GAMES_API_TOKEN

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
ENV NEXT_PUBLIC_GAMES_API_URL=$NEXT_PUBLIC_GAMES_API_URL
ENV NEXT_PUBLIC_GAMES_API_TOKEN=$NEXT_PUBLIC_GAMES_API_TOKEN

# --- REMOVED RUNTIME SECRETS ---
# ARG REDIS_HOST, REDIS_PORT, REDIS_PASSWORD and their ENV counterparts have been removed.
# They are not needed for the build and should not be baked into the image.

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Set runtime environment variables for defaults and telemetry
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# The critical runtime variables (REDIS_HOST, API tokens, etc.) will be
# injected by Cloud Run via the cloudbuild.yaml 'set-env-vars' flag.
# There is no need to declare them here.

# A more robust healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]