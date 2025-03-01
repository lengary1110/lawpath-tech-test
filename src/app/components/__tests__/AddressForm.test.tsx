import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useValidateAddress } from "../../graphql/client/useValidateAddress";
import AddressForm from "../AddressForm";
import { UI_TEXT } from "@/app/constants/constants";

// Mock GraphQL Hook
jest.mock("../../graphql/client/useValidateAddress");

const mockValidateAddress = useValidateAddress as jest.Mock;

// Helper function to fill the form
const fillAddressForm = async (postcode: string, suburb: string, state: string) => {
  await userEvent.type(screen.getByTestId("postcode-input"), postcode);
  await userEvent.type(screen.getByTestId("suburb-input"), suburb);
  await userEvent.selectOptions(screen.getByTestId("state-select"), state);
};

describe("AddressForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Rendering", () => {
    test("renders form fields correctly", () => {
      mockValidateAddress.mockReturnValue([jest.fn(), { loading: false }]);
      render(<AddressForm />);

      expect(screen.getByTestId("postcode-input")).toBeInTheDocument();
      expect(screen.getByTestId("suburb-input")).toBeInTheDocument();
      expect(screen.getByTestId("state-select")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("validates required fields", async () => {
      mockValidateAddress.mockReturnValue([jest.fn(), { loading: false }]);
      render(<AddressForm />);

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByText("Postcode must be exactly 4 digits")).toBeInTheDocument();
      expect(await screen.findByText("Suburb is required")).toBeInTheDocument();
      expect(await screen.findByText("State must be one of ACT, NSW, NT, QLD, SA, TAS, VIC, WA")).toBeInTheDocument();
    });

    test("rejects invalid postcode format", async () => {
      mockValidateAddress.mockReturnValue([jest.fn(), { loading: false }]);
      render(<AddressForm />);

      await fillAddressForm("0100", "Sydney", "NSW");
      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByText("Postcode must be a valid Australian postcode (0200-9999)")).toBeInTheDocument();
    });
  });

  describe("API Response Handling", () => {
    test("shows error message when API returns invalid address", async () => {
      mockValidateAddress.mockReturnValue([
        jest.fn().mockResolvedValueOnce({
          data: { validateAddress: { isValid: false, message: "Invalid address" } },
        }),
        { loading: false },
      ]);

      render(<AddressForm />);
      await fillAddressForm("1234", "Unknown", "NSW");

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByText("Invalid address")).toBeInTheDocument();
    });

    test("shows error message when API request fails", async () => {
      mockValidateAddress.mockReturnValue([
        jest.fn().mockRejectedValueOnce(new Error("Service unavailable")),
        { loading: false },
      ]);

      render(<AddressForm />);
      await fillAddressForm("2000", "Sydney", "NSW");

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByText("Service unavailable")).toBeInTheDocument();
    });

    test("handles undefined error case", async () => {
      mockValidateAddress.mockReturnValue([
        jest.fn().mockRejectedValueOnce(undefined),
        { loading: false },
      ]);

      render(<AddressForm />);
      await fillAddressForm("2000", "Sydney", "NSW");

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByText("An unexpected error occurred.")).toBeInTheDocument();
    });

    test("shows success message when API returns valid address", async () => {
      mockValidateAddress.mockReturnValue([
        jest.fn().mockResolvedValueOnce({
          data: { validateAddress: { isValid: true, message: "Address is valid" } },
        }),
        { loading: false },
      ]);

      render(<AddressForm />);
      await fillAddressForm("2000", "Sydney", "NSW");

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByTestId("validation-message")).toHaveTextContent("Address is valid");
    });
  });

  describe("Loading State", () => {
    test("disables button when loading", async () => {
      mockValidateAddress.mockReturnValue([jest.fn(), { loading: true }]);

      render(<AddressForm />);
      await fillAddressForm("2000", "Sydney", "NSW");

      const button = screen.getByTestId("submit-button");
      fireEvent.click(button);

      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(UI_TEXT.button.validating);
    });
  });

  describe("Accessibility", () => {
    test("respects accessibility with aria-live", async () => {
      mockValidateAddress.mockReturnValue([
        jest.fn().mockResolvedValueOnce({
          data: { validateAddress: { isValid: true, message: "Address is valid" } },
        }),
        { loading: false },
      ]);

      render(<AddressForm />);
      await fillAddressForm("2000", "Sydney", "NSW");

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(await screen.findByTestId("validation-message")).toHaveAttribute("aria-live", "assertive");
    });
  });
});
