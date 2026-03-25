# Same pattern as backend — consistency across services is important
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3002

ENV NODE_ENV=production

USER node

CMD ["node", "index.js"]
