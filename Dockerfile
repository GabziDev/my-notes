FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# dossiers perma
RUN mkdir -p /app/data /app/files

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# migration + start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]