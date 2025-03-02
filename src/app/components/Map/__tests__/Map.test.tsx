import { render, screen, waitFor } from "@testing-library/react";
import Map from "../Map";
import * as locationFetcherUtils from "../../../utils/LocationFetcher";
import userEvent from "@testing-library/user-event";
import L, { LeafletMouseEvent } from "leaflet";

jest.mock("leaflet/dist/leaflet.css", () => {});
jest.mock("../../../utils/LocationFetcher", () => ({
  fetchLocationData: jest.fn(),
}));

const fakeMapEvents: { click?: (e: LeafletMouseEvent) => void } = {};

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  MapContainer: (props: {
    children: React.ReactNode;
    onClick?: (e: MouseEvent) => void;
  }) => (
    <div
      data-testid="map"
      {...props}
      onClick={() =>
        fakeMapEvents.click &&
        fakeMapEvents.click({
          latlng: L.latLng(-33.8688, 151.2093),
        } as LeafletMouseEvent)
      }
    >
      {props.children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer"></div>,
  Marker: () => <div data-testid="marker"></div>,
  useMapEvents: (events: {
    click?: (e: LeafletMouseEvent) => void;
  }): { click?: (e: LeafletMouseEvent) => void } => {
    Object.assign(fakeMapEvents, events);
    return events;
  },
}));

describe("Map Component", () => {
  beforeEach(() => {
    delete fakeMapEvents.click;
  });

  it("renders the map correctly", () => {
    render(<Map onLocationSelect={jest.fn()} />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("handles map click and fetches location data", async () => {
    const mockOnLocationSelect = jest.fn();

    jest.spyOn(locationFetcherUtils, "fetchLocationData").mockResolvedValue({
      display_name: "Sydney, NSW, 2000, Australia",
    });

    render(<Map onLocationSelect={mockOnLocationSelect} />);

    userEvent.click(screen.getByTestId("map"));

    await waitFor(() => {
      expect(locationFetcherUtils.fetchLocationData).toHaveBeenCalledWith(
        -33.8688,
        151.2093
      );
      expect(mockOnLocationSelect).toHaveBeenCalledWith(
        "2000",
        "Sydney",
        "NSW"
      );
    });
  });

  it("handles map click when fetchLocationData returns no display_name", async () => {
    const mockOnLocationSelect = jest.fn();

    jest.spyOn(locationFetcherUtils, "fetchLocationData").mockResolvedValue({});

    render(<Map onLocationSelect={mockOnLocationSelect} />);
    userEvent.click(screen.getByTestId("map"));

    await waitFor(() => {
      expect(locationFetcherUtils.fetchLocationData).toHaveBeenCalledWith(-33.8688, 151.2093);
      expect(mockOnLocationSelect).toHaveBeenCalledWith("", "", "");
    });
  });
});
