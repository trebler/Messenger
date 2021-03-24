# Build stage
FROM mhart/alpine-node:14.16.0 as build

WORKDIR /src

COPY package.json \
    yarn.lock \
    .fork-ts-checkerrc \
    tsconfig.json \
    tsconfig_webpack.json \
    .eslintrc.js \
    .prettierrc.js \
    webpack.config.ts ./

COPY src src

RUN yarn install --frozen-lockfile --silent \
    && yarn build

# Final stage
FROM mhart/alpine-node:slim-14.16.0 as final

WORKDIR /app

COPY --from=build /src/build .

CMD [ "node", "app.js" ]