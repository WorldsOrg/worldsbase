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
MOESIF_APPLICATION_ID= # The application ID for Moesif
POSTGRES_HOST= # The host for the Postgres database
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD= # The password for the Postgres database
SECRET_KEY= # The secret key for hashing
KEY_SALT= # The salt for hashing
KEY_IV= # The IV for hashing
SERVER_URL=http://localhost:3005
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

## Step 5: Start the Development Server

Finally, to start the development server along with the client and documentation, run:

```bash
yarn run dev
```

Your setup is now complete! You can begin developing and testing your application locally.

## Accessing the Dashboard

Once the development server is up and running, you can access the dashboard by navigating to:

[http://localhost:3000](http://localhost:3000)

Here, you can sign up or log in to start exploring and using the WorldsBase.
