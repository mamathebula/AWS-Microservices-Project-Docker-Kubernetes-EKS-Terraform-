# Stage 1: Use Node.js 18 on Alpine Linux (small image)
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
# If package.json hasn't changed, Docker reuses the cached npm install layer
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Document which port the app uses (doesn't actually publish it)
EXPOSE 3001

# Set environment variable
ENV NODE_ENV=production

# Run as non-root user for security
USER node

# Command to run when the container starts
CMD ["node", "index.js"]
