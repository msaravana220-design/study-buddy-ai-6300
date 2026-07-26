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

# Railway passes these as build arguments automatically
ARG SUPABASE_URL
ARG SUPABASE_PUBLISHABLE_KEY
ARG GROQ_API_KEY
ARG SUPABASE_PROJECT_ID

# Set them as ENV vars so Vite can read them during the build process
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}
ENV GROQ_API_KEY=${GROQ_API_KEY}
ENV SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID}

# Create a .env file dynamically so Vite loads these variables reliably during build
RUN echo "VITE_SUPABASE_URL=$SUPABASE_URL" >> .env
RUN echo "VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY" >> .env
RUN echo "VITE_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID" >> .env

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
