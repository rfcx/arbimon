# Build container
FROM node:16-alpine as builder

### Install pnpm
RUN npm i -g pnpm

### Create build folder
RUN mkdir -p /app
WORKDIR /app

### Install deps
COPY pnpm-*.yaml ./
COPY package.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/utils/package.json ./packages/utils/
COPY packages/website/package.json ./packages/website/
RUN pnpm i --frozen-lockfile

### Change mode to production (after installing all deps)
ENV NODE_ENV=production

### Build
COPY tsconfig*.json ./
COPY packages/common ./packages/common
COPY packages/utils ./packages/utils
COPY packages/website ./packages/website
RUN pnpm -r build

# Production container
FROM nginx

### Copy built website from build container
COPY --from=builder /app/packages/website/dist /usr/share/nginx/html

### Delete old web-server config
RUN rm /etc/nginx/conf.d/default.conf

### Replace with new web-server config
COPY build/nginx/nginx.conf /etc/nginx/conf.d/default.conf

### Open the ports!
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
