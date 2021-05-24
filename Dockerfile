FROM node:latest

WORKDIR /main
COPY package.json .
COPY config ./config
COPY modules ./modules
RUN yarn install
COPY src ./src
COPY tsconfig.json .
RUN yarn build
ENTRYPOINT ["yarn", "start"]