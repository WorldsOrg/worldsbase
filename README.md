# Installation Guide for Local Development

This guide will help you set up your development environment to work on the project. Please follow the steps below to ensure a smooth setup process.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Git
- Node.js and yarn

## Step 1: Clone the Repository

Start by cloning the project repository and navigating to the root folder of the project:

```bash
git clone https://github.com/WorldsOrg/worldsbase.git
cd worldsbase
```

## Step 2: Install Dependencies

Install all necessary dependencies for the project by running the following command:

```bash
yarn run install:all
```

This command installs dependencies for both the server and the client components of the project.

## Step 3: Set Up Environment Variables

You will need to create .env files for both the server and the client. These files will store sensitive information and configurations.

### Server Environment Variables

Create a .env file inside the server folder and populate it with the following keys. Replace the placeholder comments with your actual values:

```env
MAIN_WALLET_PRIVATE_KEY= # The private key of the main wallet for minting and other operations
THIRDWEB_SDK_SECRET_KEY= # The secret key for the thirdweb SDK
X_API_KEY= # The API key for the server
CONTRACT_ADDRESS= # The address of the deployed contract to mint
apiPublicKey= # The public key for the Turnkey API
apiPrivateKey= # The private key for the Turnkey API
organizationId= # The organization ID for the Turnkey API
MORALIS_API_KEY= # The API key for Moralis
POSTGRES_HOST= # The host for the Postgres database
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD= # The password for the Postgres database
SECRET_KEY= # The secret key for hashing
KEY_SALT= # The salt for hashing
KEY_IV= # The IV for hashing
SERVER_URL=http://localhost:3005
CONNECTION_STRING= # The connection string for the Postgres database
```

### Client Environment Variables

Create a .env file inside the client folder with the following keys:

```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_X_API_KEY=YOUR_MATCHING_SERVER_X_API_KEY
NEXT_PUBLIC_BASE_URL=YOUR_COMPOSER_BACKEND_BASE_URL
API_PATH=http://localhost:3005
COMPOSER_API_PATH=http://localhost:3008
```

Ensure the NEXT_PUBLIC_X_API_KEY matches the X_API_KEY set in the server's .env.

## Step 4: Initialize Database Tables

Run the following command to create the required database tables:

```bash
yarn run init:tables
```

## Step 5: Hashicorp Vault Setup

Worldsbase comes with an option for Hashicorp Vault integration. If you do not want to use a Vault, set USING_VAULT=false.
If you would like to use Worldsbase's Hashicorp Vault endpoints, you need to have the following **server** env variables set:

```env
USING_VAULT=true
VAULT_ADDRESS=<your vault address>
VAULT_ROLE_ID=<your approle authentication role id>
VAULT_SECRET_ID=<your approle authentication secret id>
```

Follow these instructions to deploy a Vault on Railway for use with Worldsbase. The instructions that follow use a Railway deployment:
Here is an example template for deploying a Vault on Railway:
https://railway.app/template/vOXRB-

(If you are testing locally with a Vault deployment other than Railway and want to use the Vault's cli, you can find the corresponding commands in Hashicorp Vault's documentation)

Once your Vault is deployed on Railway, you need to unseal the vault:
```bash
export VAULT_ADDR=<your public networking endpoint from Railway>

curl \
    --request PUT \
    --data '{"secret_shares": 1, "secret_threshold": 1}' \
    ${VAULT_ADDR}/v1/sys/init
```

After running that command in the terminal you will have been returned a single unseal key which will be used in the next command:
```bash
curl \
    --request POST \
    --data '{"key":"your_unseal_key"}' \
    ${VAULT_ADDR}/v1/sys/unseal
```

This command will return a payload containing the root_token, which will be used in the next steps. Next you will mount a kv secrets engine at path `secret`:
```bash
export VAULT_TOKEN=<your root_token>

curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request POST \
    --data '{"type":"kv-v2"}' \
    ${VAULT_ADDR}/v1/sys/mounts/secret
```
The next command creates a policy for an approle authentication role that can interact with the secrets engine:
```bash
curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request PUT \
    --data '{"policy": "path \"secret/*\" { capabilities = [\"create\", \"read\", \"update\", \"delete\", \"list\"] }"}' \
     ${VAULT_ADDR}/v1/sys/policies/acl/secrets-policy
```
Enable approle auth:
```bash
curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request POST \
    --data '{"type": "approle"}' \
    ${VAULT_ADDR}/v1/sys/auth/approle
```
Fetch the associated role-id and secret-id that are needed for the env:
```bash
# create approle auth called secrets-role
curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request POST \
    --data '{"policies": "secrets-policy", "token_type": "batch"}' \
    ${VAULT_ADDR}/v1/auth/approle/role/secrets-role

# copy the role-id returned
curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request GET \
    ${VAULT_ADDR}/v1/auth/approle/role/secrets-role/role-id

# copy the secret-id returned
curl \
    --header "X-Vault-Token: ${VAULT_TOKEN}" \
    --request POST \
    ${VAULT_ADDR}/v1/auth/approle/role/secrets-role/secret-id
```
This concludes the setup of a fresh Vault that will work with Worldsbase. Ideally, you will have your vault deployed in the same environment as Worldsbase so that they can communicate over private networking (the VAULT_ADDRESS used in the curl commands is the public address exposed by Railway. If Worldsbase and Vault are deployed in the same Railway project, you can use the private networking for VAULT_ADDRESS in the env and remove the public networking for increased security).

## Step 6: Start the Development Server

Finally, to start the development server along with the client and documentation, run:

```bash
yarn run dev
```

Your setup is now complete! You can begin developing and testing your application locally.

## Accessing the Dashboard

Once the development server is up and running, you can access the dashboard by navigating to:

[http://localhost:3000](http://localhost:3000)

Here, you can sign up or log in to start exploring and using the Worldsbase.
