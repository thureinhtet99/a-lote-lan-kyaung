# syntax=docker/dockerfile:1

# Development Dockerfile for Next.js
ARG NODE_VERSION=22.17.0

FROM node:${NODE_VERSION}-alpine

# Install dependencies for better compatibility
# RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Set development environment
ENV NODE_ENV development

# Copy package files
COPY package*.json  ./

# Install all dependencies (for development)
RUN npm i

# Create non-root user for development
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
# RUN chown -R nextjs:nodejs /app
# USER nextjs

# Copy source code
# COPY --chown=nextjs:nodejs . .

# Expose the port
EXPOSE 3000

# Set environment variables for development
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the development server
CMD ["npm", "run", "dev"]
