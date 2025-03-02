import { getStateAbbreviation } from "../functions";;

describe("getStateAbbreviation", () => {
  it("should return the correct abbreviation for a given full state name", () => {
    expect(getStateAbbreviation("New South Wales")).toBe("NSW");
    expect(getStateAbbreviation("Victoria")).toBe("VIC");
    expect(getStateAbbreviation("Queensland")).toBe("QLD");
  });

  it("should return undefined for an unknown state name", () => {
    expect(getStateAbbreviation("Unknown State")).toBeUndefined();
    expect(getStateAbbreviation("")).toBeUndefined();
  });

  it("should handle case sensitivity", () => {
    expect(getStateAbbreviation("new south wales")).toBeUndefined();
  });

  it("should handle leading/trailing spaces", () => {
    expect(getStateAbbreviation(" New South Wales ")).toBeUndefined();
  });
});
