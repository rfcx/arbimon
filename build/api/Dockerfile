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
COPY packages/api/package.json ./packages/api/
RUN pnpm i --frozen-lockfile

### Change mode to production (after installing all deps)
ENV NODE_ENV=production

### Build
COPY tsconfig*.json ./
COPY packages/common ./packages/common
COPY packages/utils ./packages/utils
COPY packages/api ./packages/api
WORKDIR packages/api
RUN pnpm build

# Production container
FROM nginx

### Copy built website from build container
COPY --from=builder /app/packages/api/dist /usr/share/nginx/html

### Delete old web-server config
RUN rm /etc/nginx/conf.d/default.conf

### Replace with new web-server config
COPY build/nginx/nginx.conf /etc/nginx/conf.d/default.conf

### Open the ports!
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
