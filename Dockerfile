FROM node:18-bullseye-slim

# Install Chrome dependencies and Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg chromium chromium-sandbox \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy rest of the application
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]