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
yarn run install
```

This command installs dependencies for both the server and the client components of the project.

## Step 3: Set Up Environment Variables

You will need to create .env files for both the server and the client. These files will store sensitive information and configurations.

### Server Environment Variables

Create a .env file inside the server folder and populate it with the following keys. Replace the placeholder comments with your actual values:

```env
AFFECTION_POINTS_CONTRACT=                # Contract address for handling affection points
apiPrivateKey=                            # Private key for the Turnkey API
apiPublicKey=                             # Public key for the Turnkey API
AWS_ACCESS_KEY_ID=                        # AWS access key for cloud services
AWS_SECRET_KEY=                           # AWS secret key for cloud services
CONNECTION_STRING=                        # Database connection string (used instead of separate DB configs)
DATA_TEST=                                # Test data flag or config (adjust based on your needs)
KEY_IV=                                   # Initialization vector (IV) for hashing/encryption
KEY_SALT=                                 # Salt value for hashing/encryption
MAIN_WALLET_PRIVATE_KEY=                  # Private key of the main wallet for minting and other operations
MARKETPLACE_CONTRACT_ADDRESS=             # Contract address for the marketplace
MINT_CONTRACT_ADDRESS=                    # Contract address used for minting tokens
MOESIF_APPLICATION_ID=                    # Moesif monitoring and logging application ID
MORALIS_API_KEY=                          # API key for Moralis, used for interacting with blockchain
organizationId=                           # Organization ID for the Turnkey API
POSTGRES_DATABASE=                        # Name of the PostgreSQL database
POSTGRES_HOST=                            # Host URL or IP for PostgreSQL
POSTGRES_PASSWORD=                        # Password for the PostgreSQL user
POSTGRES_PORT=5432                        # Port number for PostgreSQL (default is 5432)
POSTGRES_USER=postgres                    # Username for PostgreSQL database
REDIS_HOST=                               # Host URL or IP for Redis cache
REDIS_PASSWORD=                           # Password for Redis cache (if required)
REDIS_PORT=6379                           # Port number for Redis (default is 6379)
REDIS_URL=                                # Redis connection URL
REDIS_USER=                               # Username for Redis (if required)
SECRET_KEY=                               # Secret key used for cryptographic functions (e.g., JWT or hashing)
SERVER_URL=http://localhost:3005          # URL where the server is hosted
STEAM_API_KEY=                            # API key to access Steam services
STEAM_APP_ID=                             # Steam App ID related to the project
STEAM_WAIFUS_CONTRACT=                    # Contract address for handling Steam Waifus NFTs
THIRDWEB_ACCESS_TOKEN=                    # Thirdweb platform access token
THIRDWEB_ENGINE_URL=                      # URL for the Thirdweb engine API
THIRDWEB_SDK_SECRET_KEY=                  # Secret key for the Thirdweb SDK
TOKEN_CONTRACT_ADDRESS=                   # Contract address for the main token
TOPUP_ADMIN_WALLET_ADDRESS=               # Wallet address used for top-up admin operations
TOPUP_CHAIN_ID=                           # Blockchain network chain ID used for top-up transactions
TOPUP_MIN_BALANCE=                        # Minimum balance allowed before top-up is required
TOPUP_MIN_TRANSFER=                       # Minimum transfer amount for top-ups
VAULT_ADDRESS=                            # Address of the secrets vault (for services like HashiCorp Vault)
VAULT_ROLE_ID=                            # Role ID for accessing the vault
VAULT_SECRET_ID=                          # Secret ID for accessing the vault
VAULT_TOKEN=                              # Authentication token for the vault
X_API_KEY=                                # The API key for the server
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

Here, you can sign up or log in to start exploring and using the Worldsbase.
