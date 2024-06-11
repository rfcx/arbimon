# Install pnpm
FROM node:18-alpine AS node-pnpm
RUN npm i -g pnpm@9

# Install deps
FROM node-pnpm AS with-deps
RUN mkdir -p /app
WORKDIR /app

COPY pnpm-*.yaml ./
COPY .npmrc ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/cli/package.json ./apps/cli/
COPY apps/website/package.json ./apps/website/
COPY packages/common/package.json ./packages/common/
COPY packages/node-common/package.json ./packages/node-common/
COPY packages/utils/package.json ./packages/utils/
COPY packages/testing/package.json ./packages/testing/

ENV NODE_ENV=development
RUN pnpm i --frozen-lockfile
RUN pnpm prepare

# Build
FROM with-deps AS build
WORKDIR /app

COPY tsconfig*.json ./
COPY tools ./tools
COPY apps ./apps
COPY packages ./packages

ARG mode=production
ARG release_commit
ARG release_date

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=8192
ENV VITE_RELEASE_COMMIT=${release_commit}
ENV VITE_RELEASE_DATE=${release_date}

RUN pnpm --filter=!website build
RUN pnpm --filter=website build --mode ${mode}
RUN if [[ "${mode}" == "production" ]] ; then rm -v apps/website/dist/robots.disallow.txt ; else mv -v apps/website/dist/robots.disallow.txt apps/website/dist/robots.txt ; fi

ENV NODE_ENV=development
RUN pnpm -r pack-api
RUN pnpm --filter=api use-packed
ENV NODE_ENV=production

# API
FROM build AS biodiversity-api
WORKDIR /app/apps/api
ENV FASTIFY_PORT=8080
ENV FASTIFY_ADDRESS=0.0.0.0
EXPOSE 8080
CMD ["node", "--experimental-specifier-resolution=node", "--no-warnings", "lib/index.js"]

# CLI
FROM build AS biodiversity-cli

# Website
FROM nginx:1.21-alpine AS biodiversity-website
COPY --from=build /app/apps/website/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY tools/deployment/website/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
