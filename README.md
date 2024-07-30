# Ecom backend

## Getting started

### Prerequisites

Create a .env file in the root directory.

Add these in the .env file:

- MONGODB_URI
- SECRET
- PORT_AUTH_SERVICE
- PORT_USERS_SERVICE
- PORT_PRODUCTS_SERVICE

Install dependencies for each microservice:

- `cd auth-service && npm install`

- `cd users-service && npm install`

- `cd products-service && npm install`

## Usage

In the root directory start each microservice:

- `npm run start:auth-service`

- `npm run start:users-service"`

- `npm run start:products-service"`
