import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

test("renders svg spinner", () => {
  render(<LoadingSpinner size="SMALL" testId="test-spinner" />)

  const svg = screen.getByTestId("test-spinner");
  expect(svg).toBeInTheDocument();
});

test("renders small spinner", () => {
  render(<LoadingSpinner size="SMALL" testId="test-spinner" />)

  const svg = screen.getByTestId("test-spinner");
  expect(svg.classList).toContain("small");
});

test("renders medium spinner", () => {
  render(<LoadingSpinner size="MEDIUM" testId="test-spinner" />)

  const svg = screen.getByTestId("test-spinner");
  expect(svg.classList).toContain("medium");
});

test("renders large spinner", () => {
  render(<LoadingSpinner size="LARGE" testId="test-spinner" />)

  const svg = screen.getByTestId("test-spinner");
  expect(svg.classList).toContain("large");
});