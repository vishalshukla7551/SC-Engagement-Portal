FROM node:20-alpine

WORKDIR /app

# Copy everything first
COPY . .

# Dependencies
RUN npm ci --ignore-scripts

# Prisma generate
RUN npx prisma generate

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
