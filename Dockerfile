FROM node:17-alpine

WORKDIR /app

COPY ./build ./

COPY ./package*.json ./

COPY ./node_modules ./node_modules

EXPOSE ${PORT:-8080}

# USER node

ENV NODE_ENV production

ENV PORT 8080

ENV HOST 0.0.0.0

ENV API_URL '/api'

ENTRYPOINT ["npm", "run", "start:prod"]
