# Install pnpm
FROM node:16-alpine as node-pnpm
RUN npm i -g pnpm@6.20.4

# Install deps
FROM node-pnpm as with-deps
RUN mkdir -p /app
WORKDIR /app

COPY pnpm-*.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/cli/package.json ./apps/cli/
COPY apps/website/package.json ./apps/website/
COPY packages/common/package.json ./packages/common/
COPY packages/utils/package.json ./packages/utils/

ENV NODE_ENV=development
RUN pnpm i --frozen-lockfile --reporter=silent
RUN pnpm prepare

# Build
FROM with-deps as build
WORKDIR /app

COPY tsconfig*.json ./
COPY tools ./tools
COPY apps ./apps
COPY packages ./packages

ARG mode=production
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN pnpm --filter=!website build
RUN pnpm --filter=website build -- --mode ${mode}
ENV NODE_ENV=development
RUN pnpm -r pack-api
RUN pnpm --filter=api use-packed
ENV NODE_ENV=production

# API
FROM build as api
WORKDIR /app/apps/api
ENV FASTIFY_PORT=8080
ENV FASTIFY_ADDRESS=0.0.0.0
EXPOSE 8080
CMD ["node", "--experimental-specifier-resolution=node", "lib/index.js"]

# CLI
FROM build as cli

# Website
FROM nginx:1.21-alpine as website
COPY --from=build /app/apps/website/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY tools/deployment/website/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
