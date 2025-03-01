import { renderHook } from "@testing-library/react";
import { useLazyQuery } from "@apollo/client";
import { useValidateAddress } from "../useValidateAddress";
import { VALIDATE_ADDRESS } from "../useValidateAddress";

jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useLazyQuery: jest.fn(),
}));

describe("useValidateAddress", () => {
  it("should call useLazyQuery with VALIDATE_ADDRESS", () => {
    renderHook(() => useValidateAddress());
    expect(useLazyQuery).toHaveBeenCalledWith(VALIDATE_ADDRESS);
  });
});
