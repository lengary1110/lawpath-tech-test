import { gql } from "@apollo/client";
import client from "../lib/apolloClient";

const VALIDATE_ADDRESS_QUERY = gql`
  query ValidateAddress($postcode: String!, $suburb: String!, $state: String!) {
    validateAddress(postcode: $postcode, suburb: $suburb, state: $state) {
      isValid
      message
    }
  }
`;

export const validateAddress = async (postcode: string, suburb: string, state: string): Promise<string> => {
  try {
    const { data } = await client.query({
      query: VALIDATE_ADDRESS_QUERY,
      variables: { postcode, suburb, state },
      fetchPolicy: "network-only",
    });

    return data.validateAddress.message;
  } catch (error) {
    console.error("GraphQL Validation Error:", error);
    return "Error validating address.";
  }
};
