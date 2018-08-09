FROM node:9-alpine

WORKDIR /app

COPY package.json yarn.lock ./
#RUN yarn --pure-lockfile --no-cache

COPY tsconfig.json ./
COPY img ./img
COPY public ./public
COPY src ./src
COPY typings ./typings
COPY webpack/ ./webpack

#RUN yarn build#

EXPOSE 8080
CMD [ "yarn", "start" ]