import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useValidateAddress } from "../../graphql/client/useValidateAddress";
import AddressForm from "../AddressForm";
import { UI_TEXT } from "../../constants/constants";

// Mock GraphQL Hook
jest.mock("../../graphql/client/useValidateAddress");

describe("AddressForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form fields correctly", () => {
    // Mock API
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn(),
      { loading: false },
    ]);

    render(<AddressForm />);

    expect(
      screen.getByLabelText(UI_TEXT.formLabels.postcode)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(UI_TEXT.formLabels.suburb)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(UI_TEXT.formLabels.state)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_TEXT.button.validate })
    ).toBeInTheDocument();
  });

  test("validates required fields", async () => {
    // Mock API
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn(),
      { loading: false },
    ]);

    render(<AddressForm />);

    fireEvent.click(
      screen.getByRole("button", { name: UI_TEXT.button.validate })
    );

    expect(await screen.findByText("Postcode must be exactly 4 digits")).toBeInTheDocument();
    expect(await screen.findByText("Suburb is required")).toBeInTheDocument();
    expect(await screen.findByText("State must be one of ACT, NSW, NT, QLD, SA, TAS, VIC, WA")).toBeInTheDocument();
  });

  test("shows error message when API returns invalid address", async () => {
    // Mock API return invalid response
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          validateAddress: { isValid: false, message: "Invalid address" },
        },
      }),
      { loading: false },
    ]);
    render(<AddressForm />);

    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.postcode),
      "1234"
    );
    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.suburb),
      "Unknown"
    );
    await userEvent.selectOptions(
      screen.getByLabelText(UI_TEXT.formLabels.state),
      "NSW"
    );

    fireEvent.click(
      screen.getByRole("button", { name: UI_TEXT.button.validate })
    );

    expect(await screen.findByText("Invalid address")).toBeInTheDocument();
  });

  test("shows error message when API request fails", async () => {
    // Mock API service error
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Service unavailable")),
      { loading: false },
    ]);
  
    render(<AddressForm />);
  
    await userEvent.type(screen.getByLabelText(UI_TEXT.formLabels.postcode), "2000");
    await userEvent.type(screen.getByLabelText(UI_TEXT.formLabels.suburb), "Sydney");
    await userEvent.selectOptions(screen.getByLabelText(UI_TEXT.formLabels.state), "NSW");
  
    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.button.validate }));
  
    expect(await screen.findByText("Service unavailable")).toBeInTheDocument();
  });

  test("handles undefined error case", async () => {
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(undefined),
      { loading: false },
    ]);
  
    render(<AddressForm />);
  
    await userEvent.type(screen.getByLabelText(UI_TEXT.formLabels.postcode), "2000");
    await userEvent.type(screen.getByLabelText(UI_TEXT.formLabels.suburb), "Sydney");
    await userEvent.selectOptions(screen.getByLabelText(UI_TEXT.formLabels.state), "NSW");
  
    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.button.validate }));
  
    expect(await screen.findByText("An unexpected error occurred.")).toBeInTheDocument();
  });
  
  
  test("shows success message when API returns valid address", async () => {
    // Mock API return valid response
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          validateAddress: { isValid: true, message: "Address is valid" },
        },
      }),
      { loading: false },
    ]);

    render(<AddressForm />);

    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.postcode),
      "2000"
    );
    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.suburb),
      "Sydney"
    );
    await userEvent.selectOptions(
      screen.getByLabelText(UI_TEXT.formLabels.state),
      "NSW"
    );

    fireEvent.click(
      screen.getByRole("button", { name: UI_TEXT.button.validate })
    );

    expect(await screen.findByText("Address is valid")).toBeInTheDocument();
  });

  test("disables button when loading", async () => {
    // Mock API loading
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn(),
      { loading: true },
    ]);

    render(<AddressForm />);

    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.postcode),
      "2000"
    );
    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.suburb),
      "Sydney"
    );
    await userEvent.selectOptions(
      screen.getByLabelText(UI_TEXT.formLabels.state),
      "NSW"
    );

    const button = screen.getByRole("button", {
      name: UI_TEXT.button.validate,
    });
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });

  test("respects accessibility with aria-live", async () => {
    // Mock API return valid response
    (useValidateAddress as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          validateAddress: { isValid: true, message: "Address is valid" },
        },
      }),
      { loading: false },
    ]);

    render(<AddressForm />);

    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.postcode),
      "2000"
    );
    await userEvent.type(
      screen.getByLabelText(UI_TEXT.formLabels.suburb),
      "Sydney"
    );
    await userEvent.selectOptions(
      screen.getByLabelText(UI_TEXT.formLabels.state),
      "NSW"
    );

    fireEvent.click(
      screen.getByRole("button", { name: UI_TEXT.button.validate })
    );

    expect(await screen.findByText("Address is valid")).toHaveAttribute(
      "aria-live",
      "polite"
    );
  });
});
