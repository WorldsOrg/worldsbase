# Use the official Node.js 16 as a parent image
FROM node:slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Bundle the app source code inside the Docker image
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3003

ENV PORT 3003

ENV HOSTNAME "0.0.0.0"

ENV apiPublicKey 020e9906f6d9916c5106553429d0f0549e4d7688d0cb84a6f28bf3da1501e615e6
ENV apiPrivateKey 39c508f4639dd1b453cf0f13f29274d92788c760fc3aacb5e1d045e1a436ef81
ENV organizationId cfc11de9-5062-4834-aaea-f8ff5ea327b8
ENV moesifId eyJhcHAiOiI5Nzk6Mjc5IiwidmVyIjoiMi4xIiwib3JnIjoiNTUyOjI0MyIsImlhdCI6MTcwNDA2NzIwMH0.YZXU2mF4hfB4AfZAwl6DwWFdCSVKexeC51BbCLNFoJM
ENV SYNDICATE_API_KEY Iw5hnHHBLOdUOV4vYcha
ENV X_API_KEY 323f7dfb-6ba3-4ba0-99cb-c493a3a712d7
ENV POSTGRES_HOST aws-0-us-west-1.pooler.supabase.com
ENV POSTGRES_PORT 5432
ENV POSTGRES_USER postgres.dlbdmxiemnqhmmtcdcxw
ENV POSTGRES_DATABASE postgres
ENV POSTGRES_PASSWORD bIRn1BtKnvOBEt26
ENV SECRET_KEY faf049fuajlwf1!0.sf??1ASADF1
ENV SERVER_URL http://localhost:3003

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "dist/src/index.js" ]
