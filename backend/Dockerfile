# Stage 1: Install dependencies
FROM oven/bun:1-deps AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client or any other build steps if needed
# RUN bun run build

# Stage 3: Production image
FROM oven/bun:1 AS runner

WORKDIR /app

# Create production directory
ENV NODE_ENV=production

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy the rest of the application
COPY --from=builder /app/src ./src
COPY --from=builder /app/sqlite ./sqlite

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3001

# Set environment variables
ENV PORT=3001
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/ || exit 1

# Start the application
CMD ["bun", "run", "src/index.ts"]
