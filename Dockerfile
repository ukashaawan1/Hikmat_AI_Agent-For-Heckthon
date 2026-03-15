# Use official Node.js image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
