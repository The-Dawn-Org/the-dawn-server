# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# GKE policies commonly require a non-root user.
USER node

# Non-secret defaults. app.module.ts defaults DB_NAME to "postgres" while
# database.module.ts defaults it to "hatzot" - pinning it here keeps both
# connections on the same database. Credentials stay runtime-only (GKE Secret).
ENV DB_HOST=localhost \
    DB_PORT=5432 \
    DB_NAME=hatzot

ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main.js"]
