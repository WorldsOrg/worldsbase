# WGS Docs

This is a documentation for the WGS project.

[**Live Demo →**](https://demo.worlds.org)

## Quick Start

Click the button to clone this repository

## Local Development

First, run `npm run install:all` to install the dependencies.

Create .env file inside server folder and add the following:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
apiPublicKey= // turnkey api public key
apiPrivateKey= // turnkey api private key
organizationId= // turnkey organization id
moesifId=
SYNDICATE_API_KEY=
X_API_KEY= // this is the key that your clients will send in the header
POSTGRES_HOST=
POSTGRES_PORT=5432
POSTGRES_USER=
POSTGRES_DATABASE=
POSTGRES_PASSWORD=
```

Create .env file inside client folder and add the following:

```env
NEXT_PUBLIC_API_BASE_URL=/api  //if you are hosting your backend on a different domain, you can change this
NEXT_PUBLIC_X_API_KEY= // should match the server x-api-key
NEXT_PUBLIC_BASE_URL= // this is the base url of composer-backend - WIP
```

Then, run `npm run dev` to start the development server, client and docs,

dashboard localhost:3000, docs: localhost:3001, server: localhost:3003.

## License

This project is licensed under the MIT License.
