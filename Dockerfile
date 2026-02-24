# Development dependencies
FROM node:20-alpine AS deps-dev
WORKDIR /app
COPY package*.json ./
RUN npm install  # All dependencies including dev

# Production dependencies
FROM node:20-alpine AS deps-prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Only production deps

# Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Use dev dependencies for building
COPY --from=deps-dev /app/node_modules ./node_modules

COPY . .
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app

# Use production dependencies
COPY --from=deps-prod /app/node_modules ./node_modules

COPY --from=builder /app/.next ./.next
COPY package.json ./

CMD ["npm", "start"]