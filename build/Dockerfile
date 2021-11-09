# Install pnpm
FROM node:16-alpine as node-pnpm
RUN npm i -g pnpm@6.20.4

# Install deps
FROM node-pnpm as with-deps
RUN mkdir -p /app
WORKDIR /app
COPY pnpm-*.yaml ./
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/common/package.json ./packages/common/
COPY packages/utils/package.json ./packages/utils/
COPY packages/website/package.json ./packages/website/
ENV NODE_ENV=development
RUN pnpm i --frozen-lockfile

# Build
FROM with-deps as build
WORKDIR /app
COPY tsconfig*.json ./
COPY packages/api ./packages/api
COPY packages/common ./packages/common
COPY packages/utils ./packages/utils
COPY packages/website ./packages/website
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN pnpm -r build

# API
FROM build as api
WORKDIR /app/packages/api
EXPOSE 8080
CMD ["node", "dist/src/index.js"]

# Website
FROM nginx as website
COPY --from=build /app/packages/website/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY build/website/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
