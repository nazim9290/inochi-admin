# Inochi Admin — Vite + React static SPA, served by `serve`
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

# Build-time env vars — Vite inlines VITE_* into the client bundle at build time
ARG VITE_API_BASE_URL
ARG VITE_YOUTUBE_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_YOUTUBE_API_KEY=$VITE_YOUTUBE_API_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/ || exit 1

CMD ["serve", "-s", "dist", "-l", "4000"]
