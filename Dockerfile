FROM node:24-alpine AS builder
ENV CI=true

RUN npm install -g pnpm@latest
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/

RUN pnpm install --frozen-lockfile

COPY api/prisma ./api/prisma
RUN cd api && pnpm run db:generate

COPY . .
RUN cd api && pnpm run build

FROM node:24-alpine AS production

RUN npm install -g pnpm@latest
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/

RUN pnpm install --prod --frozen-lockfile && pnpm store prune

COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/prisma ./api/prisma
COPY --from=builder /app/api/src/generated ./api/src/generated

EXPOSE 3000

CMD ["pnpm", "run", "--filter", "api", "start:prod"]