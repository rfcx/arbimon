# build stage
FROM node:lts-alpine as builder

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

COPY package*.json .
RUN npm ci --production=false

COPY . .
RUN npm run build

# production state
FROM nginx

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 7373
CMD ["nginx", "-g", "daemon off;"]
