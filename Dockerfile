FROM node:20-alpine

WORKDIR /app

# Copy everything first
COPY . .

# Dependencies with memory optimization
RUN npm ci --ignore-scripts --legacy-peer-deps --no-audit --no-fund

# Prisma generate
RUN npx prisma generate

# Build with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

EXPOSE 3000

CMD ["npm", "start"]
