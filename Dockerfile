FROM node:latest

WORKDIR /main
COPY package.json .
COPY config ./config
COPY src ./src
COPY modules ./modules
RUN yarn install
COPY tsconfig.json .
ENTRYPOINT ["yarn", "start"]