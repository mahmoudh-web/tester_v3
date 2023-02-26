# syntax=docker/dockerfile:1
FROM node:16

WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]