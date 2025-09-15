# 1. Use official Node.js image
FROM node:trixie-slim AS base

# 2. Set working directory inside the container
WORKDIR /app

# 3. Install dependencies separately (better caching)
COPY package*.json ./
RUN npm install -g pnpm@latest-10
RUN pnpm i

# 4. Copy project files
COPY . .

# 5. Build the Next.js app
RUN pnpm build

# 6. Use a lightweight image for production
FROM node:trixie-slim AS runner
WORKDIR /app

# Copy only necessary files from build
COPY --from=base /app/package*.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules

# Set environment variables
ENV PORT 3000 
EXPOSE 3000

# Start Next.js
CMD ["pnpm", "start"]
