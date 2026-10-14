# Build the web app bundles
FROM node:9.11.2-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile
COPY tsconfig.json ./
COPY webpack ./webpack
COPY src ./src
RUN yarn build

# Install only the packages the server needs
FROM node:9.11.2-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --production --pure-lockfile

FROM node:9.11.2-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json app.js ./
COPY css ./css
COPY img ./img
COPY src/index.html ./src/index.html
COPY --from=build /app/dist ./dist
# Files served from /public (like the resume) aren't in git; the build
# copies them into public/ before running docker build
COPY public ./public
EXPOSE 3000
CMD ["node", "app.js"]
