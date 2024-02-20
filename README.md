# WGS Docs

This is a template for creating documentation with [Nextra](https://nextra.site).

[**Live Demo →**](https://demo.worlfs.org)

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
NEXT_PUBLIC_SUPABASEURL=
NEXT_PUBLIC_SUPABASEKEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003
NEXT_PUBLIC_X_API_KEY= // should match the server x-api-key
NEXT_PUBLIC_BASE_URL= // this is the base url of composer-backend - WIP
```

Then, run `npm run dev` to start the development server, client and docs,

dashboard localhost:3000, docs: localhost:3001, server: localhost:3003.

## License

This project is licensed under the MIT License.
