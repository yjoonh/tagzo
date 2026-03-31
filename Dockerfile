FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3006
ENV PORT=3006
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
