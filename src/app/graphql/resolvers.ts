const API_URL =
  "https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json";
const AUTH_TOKEN = "7710a8c5-ccd1-160f-70cf03e8-b2bbaf01";

interface Locality {
  location: string;
  postcode: string;
  state: string;
}

interface ApiResponse {
  localities?: {
    locality?: Locality | Locality[];
  };
}

interface ValidateAddressArgs {
  postcode: string;
  suburb: string;
  state: string;
}

export const resolvers = {
  Query: {
    validateAddress: async (_: unknown, { postcode, suburb, state }: ValidateAddressArgs) => {
      try {
        // ✅ Step 1: Query API using postcode only
        const response = await fetch(`${API_URL}?q=${postcode}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        // ✅ Parse API response and prevent JSON parsing errors
        const data: ApiResponse = await response.json();

        // ✅ Extract localities and ensure a consistent data structure
        const localities: Locality[] = Array.isArray(data.localities?.locality)
          ? data.localities.locality
          : data.localities?.locality
          ? [data.localities.locality]
          : [];

        if (localities.length === 0) {
          return {
            isValid: false,
            message: `Postcode "${postcode}" is invalid.`,
          };
        }

        // ✅ Step 2: Check if the postcode matches the suburb
        const matchedSuburb = localities.find(
          (loc) => loc.location.toLowerCase() === suburb.toLowerCase()
        );

        if (!matchedSuburb) {
          return {
            isValid: false,
            message: `The postcode ${postcode} does not match the suburb "${suburb}".`,
          };
        }

        // ✅ Step 3: Verify if the suburb matches the state (only if state is provided)
        if (state && matchedSuburb.state !== state) {
          return {
            isValid: false,
            message: `The suburb ${suburb} does not exist in the state (${state}).`, // TODO：implement full error message
          };
        }

        // ✅ Step 4: All validations passed
        return {
          isValid: true,
          message: "The postcode, suburb, and state input are valid.",
        };
      } catch (error) {
        console.error("Validation error:", error);
        return {
          isValid: false,
          message: "Failed to validate address. Please try again later.",
        };
      }
    },
  },
};




