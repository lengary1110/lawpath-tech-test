import axios from "axios";

const API_URL = "https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json";
const AUTH_TOKEN = "7710a8c5-ccd1-160f-70cf03e8-b2bbaf01"; // Bearer Token

export const validateAddress = async (postcode: string, suburb: string, state: string): Promise<string> => {
  try {
    const response = await axios.get(API_URL, {
      params: { q: suburb, state: state },
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    const data = response.data;

    // Check if localities exist in the API response
    if (!data.localities || !data.localities.locality) {
      return `The suburb ${suburb} does not exist in the state ${state}.`;
    }

    const matchedLocalities = Array.isArray(data.localities.locality)
      ? data.localities.locality
      : [data.localities.locality];

    // Check if the suburb exists in the given state
    const isSuburbInState = matchedLocalities.some((loc: { state: string; }) => loc.state === state);
    if (!isSuburbInState) {
      return `The suburb ${suburb} does not exist in the state ${state}.`;
    }

    // Check if the postcode matches the suburb
    const isPostcodeMatch = matchedLocalities.some((loc: { postcode: { toString: () => string; }; }) => loc.postcode.toString() === postcode);
    if (!isPostcodeMatch) {
      return `The postcode ${postcode} does not match the suburb ${suburb}.`;
    }

    return "The postcode, suburb, and state input are valid.";
  } catch (error) {
    console.error("Address validation error:", error);
    return "An error occurred while validating the address. Please try again.";
  }
};
