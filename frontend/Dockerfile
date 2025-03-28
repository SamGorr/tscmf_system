FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json* yarn.lock* ./
RUN npm install

# Explicitly install chart libraries
RUN npm install recharts --save

# Copy application code
COPY . .

# Generate tailwind.config.js if it doesn't exist
RUN if [ ! -f tailwind.config.js ]; then npx tailwindcss init; fi

# Set environment variables
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_PORT=0
ENV HOST=0.0.0.0
ENV PUBLIC_URL=http://localhost:3000

# Start the application with hot-reloading
CMD ["npm", "start"] 