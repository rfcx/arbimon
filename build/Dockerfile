# Build container
FROM node:15-alpine as builder

ENV NODE_ENV=production

## Install pnpm
RUN npm i -g pnpm

## Create build folder
RUN mkdir -p /app
WORKDIR /app

## Install deps
COPY pnpm-*.yaml ./
COPY packages/common/package*.json ./packages/common/
COPY packages/utils/package*.json ./packages/utils/
COPY packages/website/package*.json ./packages/website/
RUN pnpm i --frozen-lockfile

## Build
COPY packages/common ./packages/common
COPY packages/utils ./packages/utils
COPY packages/website ./packages/website
RUN pnpm -r build

# Production container
FROM nginx

COPY --from=builder /app/packages/website/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY build/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
