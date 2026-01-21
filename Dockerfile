# Noor CBT Backend Dockerfile
# Build: docker build -t noor-cbt-api .
# Run: docker run -p 5000:5000 --env-file .env noor-cbt-api

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY server/ ./server/
COPY shared/ ./shared/
COPY tsconfig.json ./

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/tsconfig.json ./

# Copy assets and templates
COPY assets/ ./assets/
COPY app.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["npx", "tsx", "server/index.ts"]
