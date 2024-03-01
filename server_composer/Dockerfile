# Build local monorepo image
# docker build --no-cache -t  outerbridge .
# Run image
# docker run -d -p 3000:3000 outerbridge
FROM node:16

WORKDIR /usr/src/packages

# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./

# Copy components package.json
COPY packages/components/package.json ./packages/components/package.json

# Copy server package.json
COPY packages/server/package.json ./packages/server/package.json

RUN yarn install --ignore-engines

# Copy app source
COPY . .

RUN yarn build

EXPOSE 3008

ENV PORT 3008

ENV HOSTNAME "0.0.0.0"

CMD [ "yarn", "start" ]
