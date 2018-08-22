FROM node:9-alpine as base
RUN apk add --no-cache bash curl

# Create small node_modules for Node server
FROM base as server-prod-deps
WORKDIR /app/server
COPY server/package.json .
COPY server/yarn.lock .
RUN yarn --production --pure-lockfile

# Create Node server bundles
FROM server-prod-deps as server
WORKDIR /app/server
RUN yarn --pure-lockfile
COPY server/webpack.server.js .
COPY server/tsconfig.json .
COPY server/src ./src
RUN yarn build

# Create React web app bundles
FROM base as webapp
WORKDIR /app/webapp
COPY webapp/package.json .
COPY webapp/yarn.lock .
RUN yarn --pure-lockfile
COPY webapp/webpack.common.js .
COPY webapp/webpack.prod.js .
COPY webapp/tsconfig.json .
COPY webapp/css ./css
COPY webapp/src ./src
RUN yarn build

# Combine node_modules and bundles
FROM base as release
WORKDIR /app/server
COPY server/img ./img
COPY server/public ./public
COPY server/package.json .
COPY --from=server-prod-deps /app/server/node_modules ./node_modules
COPY --from=server /app/server/dist ./dist
COPY --from=webapp /app/webapp/dist ./dist
EXPOSE 3000
CMD [ "yarn", "start" ]
