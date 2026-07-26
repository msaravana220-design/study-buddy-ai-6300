# Step 1: Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Step 2: Dependencies stage
FROM base AS deps
COPY package.json bun.lock* package-lock.json* ./
RUN npm install

# Step 3: Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build
# Create dist directory from .output/public to satisfy build tools expecting a dist directory
RUN mkdir -p dist && cp -r .output/public/* dist/ 2>/dev/null || true

# Step 4: Runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
