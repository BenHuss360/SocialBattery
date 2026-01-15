import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { Battery } from "./Battery";

describe("Battery", () => {
  it("renders with default props", () => {
    render(<Battery level={3} />);

    // Should show the level label
    expect(screen.getByText("Half")).toBeInTheDocument();

    // Should have accessible label
    const svg = screen.getByRole("img");
    expect(svg).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Half (3 of 5)")
    );
  });

  it("renders different levels correctly", () => {
    const { rerender } = render(<Battery level={1} />);
    expect(screen.getByText("Empty")).toBeInTheDocument();

    rerender(<Battery level={5} />);
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("hides label when showLabel is false", () => {
    render(<Battery level={3} showLabel={false} />);
    expect(screen.queryByText("Half")).not.toBeInTheDocument();
  });

  it("calls onChange when clicked in interactive mode", () => {
    const onChange = vi.fn();
    render(<Battery level={3} interactive onChange={onChange} />);

    // Click on a segment (using the radio role)
    // Segments are rendered in order: 5, 4, 3, 2, 1 (top to bottom in UI)
    // But getAllByRole returns them in DOM order which maps LEVELS array order
    const segments = screen.getAllByRole("radio");
    fireEvent.click(segments[4]); // Last segment in LEVELS array = level 5

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("does not call onChange when not interactive", () => {
    const onChange = vi.fn();
    render(<Battery level={3} onChange={onChange} />);

    // Should not have radio roles when not interactive
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation in interactive mode", () => {
    const onChange = vi.fn();
    render(<Battery level={3} interactive onChange={onChange} />);

    const segments = screen.getAllByRole("radio");
    const middleSegment = segments[2]; // Level 3

    // Focus and press Enter
    fireEvent.keyDown(middleSegment, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(3);

    // Press ArrowUp
    onChange.mockClear();
    fireEvent.keyDown(middleSegment, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(4);

    // Press ArrowDown
    onChange.mockClear();
    fireEvent.keyDown(middleSegment, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Battery level={3} size="sm" />);
    let svg = screen.getByRole("img");
    expect(svg).toHaveAttribute("width", "60");

    rerender(<Battery level={3} size="lg" />);
    svg = screen.getByRole("img");
    expect(svg).toHaveAttribute("width", "120");
  });

  it("has radiogroup role when interactive", () => {
    render(<Battery level={3} interactive onChange={() => {}} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});
