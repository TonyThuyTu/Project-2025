# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source code
COPY . .

# Expose dev port
EXPOSE 3000

# Start dev server with hot reload
CMD ["npm", "run", "dev"]
