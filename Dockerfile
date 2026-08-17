# Stage 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Set NODE_ENV to development for build stage so devDependencies are installed
ENV NODE_ENV=development

# Copy package configuration files explicitly
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Install root & backend build dependencies
RUN npm install
RUN cd backend && npm install

# Copy application source code
COPY . .

# Build Vite static frontend (/app/dist)
RUN npm run build

# Build TypeScript backend (/app/backend/dist)
RUN cd backend && npm run build

# Stage 2: Production Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Copy root & backend package files explicitly (prevent wildcard file overwrites)
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Copy built frontend static bundle & compiled backend output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist

# Install production dependencies
RUN npm install --omit=dev || npm install --only=production
RUN cd backend && (npm install --omit=dev || npm install --only=production)

EXPOSE 80

# Start unified Express server (serves API & static frontend SPA)
CMD ["node", "backend/dist/server.js"]