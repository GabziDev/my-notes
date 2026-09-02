FROM node:24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY --from=builder /app ./

# dossiers perma
RUN mkdir -p /app/data /app/files

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]