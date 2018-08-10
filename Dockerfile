FROM node:9-alpine as base
RUN apk add --no-cache bash

# Create small node_modules for Node server
FROM base as backend-prod-deps
WORKDIR /app/backend
COPY backend/package.json .
COPY backend/yarn.lock .
RUN yarn --production --pure-lockfile

# Create Node server bundles
FROM backend-prod-deps as backend
WORKDIR /app/backend
RUN yarn --pure-lockfile
COPY backend/webpack.backend.js .
COPY backend/tsconfig.json .
COPY backend/src ./src
RUN yarn build

# Create React web app bundles
FROM base as frontend
WORKDIR /app/frontend
COPY frontend/package.json .
COPY frontend/yarn.lock .
RUN yarn --pure-lockfile
COPY frontend/webpack.common.js .
COPY frontend/webpack.prod.js .
COPY frontend/tsconfig.json .
COPY frontend/src ./src
RUN yarn build

# Combine node_modules and bundles
FROM base as release
WORKDIR /app/backend
COPY backend/css ./css
COPY backend/img ./img
COPY backend/public ./public
COPY backend/package.json .
COPY --from=backend-prod-deps /app/backend/node_modules ./node_modules
COPY --from=backend /app/backend/dist ./dist
COPY --from=frontend /app/frontend/dist ./dist
RUN apk add --no-cache wget
EXPOSE 3000
CMD [ "yarn", "start" ]
