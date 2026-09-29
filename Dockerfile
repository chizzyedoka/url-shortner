FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]