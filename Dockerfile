FROM node:22-alpine

WORKDIR /app

## Install system dependencies
RUN apk -U upgrade && \
    apk add --no-cache bash curl jq

## Copy project files to workdir
COPY . .

RUN set -ex && \
    rm -rf package-lock.json && \
    yarn install --non-interactive && \
    yarn build && \
    yarn install --non-interactive --prod && \
    yarn cache clean

EXPOSE 8080

ENTRYPOINT ["yarn", "start"]
