FROM node:18.20.4

WORKDIR /app

# Copy and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend code
COPY backend ./backend

# Copy frontend code
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Go back to root
WORKDIR /app

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
