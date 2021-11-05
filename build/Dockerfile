# build stage
FROM node:16-alpine as builder

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

COPY packages/website/package*.json ./
RUN npm ci --include=dev --production=false

COPY packages/website .
RUN npm run build

# production state
FROM nginx

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY build/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
