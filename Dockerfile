FROM nginx

ENV NODE_ENV=production

RUN mkdir -p /app/biodiversity-analytics

WORKDIR /app/biodiversity-analytics

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY --from=0 /app/biodiversity-analytics/dist /usr/share/nginx/html

EXPOSE 7373
