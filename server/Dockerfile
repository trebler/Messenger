# uWebSockets build stage
FROM alpine:3.13.2 as uws_build

RUN apk add --no-cache \
    git \
    make \
    g++ \
    clang \
    zlib-dev \
    openssl-dev \
    curl \
    llvm-dev \
    libuv-dev

WORKDIR /src

ARG UWEBSOCKETS_COMMIT=61fa4bd

RUN git clone \
    --recurse-submodules \
    -j8 \
    --branch master \
    --single-branch \
    https://github.com/uNetworking/uWebSockets.js.git . \
    && git config --global advice.detachedHead false \
    && git checkout "${UWEBSOCKETS_COMMIT}" \
    && make

# Build stage
FROM mhart/alpine-node:14.16.0 as app_build

WORKDIR /src

COPY package.json \
    yarn.lock \
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

COPY --from=uws_build /src/dist/uws_linux_x64_83.node node_modules/uWebSockets.js/

COPY --from=app_build \
    /src/node_modules/uWebSockets.js/package.json \
    /src/node_modules/uWebSockets.js/uws.js \
    node_modules/uWebSockets.js/

COPY --from=app_build /src/build .

CMD [ "node", "app.js" ]