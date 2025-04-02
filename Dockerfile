FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all files
COPY . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Start the application
CMD ["npm", "start"]