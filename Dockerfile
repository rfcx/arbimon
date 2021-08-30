FROM node:lts-alpine

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

COPY package*.json .
RUN npm ci --production=false

COPY . .
RUN npm run build


FROM nginx
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 7373
CMD ["nginx", "-g", "daemon off;"]
