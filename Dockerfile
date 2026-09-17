# Stage 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

# Copy package configuration files
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Install root & backend dependencies for building
RUN npm install
RUN cd backend && npm install

# Copy application source code
COPY . .

# Build Vite static frontend (/app/dist)
RUN npm run build

# Build TypeScript backend (/app/backend/dist)
RUN cd backend && npm run build

# Stage 2: Ultra-slim Production Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Only copy backend package files (frontend is already bundled in /app/dist)
COPY backend/package.json backend/package-lock.json* ./backend/

# Copy built frontend static bundle & compiled backend output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist

# Install ONLY backend production dependencies and wipe npm cache completely
RUN cd backend && \
    npm install --omit=dev --no-audit --no-fund --ignore-scripts && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/*

EXPOSE 80

# Start unified Express server (serves API & static frontend SPA)
CMD ["node", "backend/dist/server.js"]
