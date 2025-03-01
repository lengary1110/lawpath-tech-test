# Lawpath Tech Test

This repository contains the solution for the Lawpath technical test, built using Next.js and TypeScript.

## Project Overview

This project is a Next.js application designed to handle address validation via GraphQL APIs. It includes form validation, API integrations, and testing setups to ensure reliability and maintainability.

## Tech Stack

- **Framework**: Next.js
- **Programming Language**: TypeScript
- **State Management**: Apollo Client
- **Validation**: Zod
- **Form Handling**: React Hook Form
- **UI Library**: Chakra UI
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint
- **Package Manager**: Yarn

## Installation

To set up and run the project locally, follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/lengary1110/lawpath-tech-test.git
   cd lawpath-tech-test
   ```

2. Install dependencies:

   ```sh
   yarn install
   ```

3. Start the development server:

   ```sh
   yarn dev
   ```

## Usage

- Navigate to `http://localhost:3000/` to use the app.
- Enter an address in the form and submit to validate it against the API.

## Testing

Run tests using Jest and React Testing Library:

```sh
yarn test
```

The coverage for all files is 100%.
![test-coverage](https://github.com/user-attachments/assets/cd8ab414-4590-45de-953d-4ac6187fb55f)

## GraphQL

The project includes a GraphQL API for address validation.

- **API Endpoint**: `http://localhost:3000/api/graphql`
- **Apollo Client Setup**: Configured in `lib/apolloClient.ts`

## Future Improvements

- Expand GraphQL Queries and Mutations for Additional Features
- Implement Debounced API Calls to Optimize Performance
- Implement caching strategies for API calls
- Suburb Recommendation Search After Inputting Postcode

