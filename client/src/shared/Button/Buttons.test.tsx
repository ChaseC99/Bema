import { render, screen } from '@testing-library/react';
import { renderWithRouter } from '../../util/testing-utils';
import Button from "./Button";

test("renders a link button correctly", () => {
  renderWithRouter(<Button type="primary" role="link" action="/test" text="Test Button" testId="test-button" />);

  const button: HTMLAnchorElement = screen.getByTestId("test-button");
  expect(button).toBeInTheDocument();
  expect(button.innerHTML).toMatch("Test Button");
  expect(button.href).toMatch("/test");
});

test("renders an action button correctly", () => {
  let action = () => {};
  render(<Button type="primary" role="button" action={action} text="Test Button" testId="test-button" />);

  const button = screen.getByTestId("test-button");
  expect(button).toBeInTheDocument();
  expect(button.innerHTML).toMatch("Test Button");
  expect(button).toHaveProperty("onclick");
});

test("renders a primary button correctly", () => {
  let action = () => {};
  render(<Button type="primary" role="button" action={action} text="Test Button" testId="test-button" />);

  const button = screen.getByTestId("test-button");
  expect(button).toBeInTheDocument();
  expect(button.classList).toContain("btn-primary");
});

test("renders a secondary button correctly", () => {
  let action = () => {};
  render(<Button type="secondary" role="button" action={action} text="Test Button" testId="test-button" />);

  const button = screen.getByTestId("test-button");
  expect(button).toBeInTheDocument();
  expect(button.classList).toContain("btn-secondary");
});

test("renders a tertiary button correctly", () => {
  let action = () => {};
  render(<Button type="tertiary" role="button" action={action} text="Test Button" testId="test-button" />);

  const button = screen.getByTestId("test-button");
  expect(button).toBeInTheDocument();
  expect(button.classList).toContain("btn-tertiary");
});

test("renders a disabled button correctly", () => {
  let action = () => {};
  render(<Button type="primary" role="button" action={action} text="Test Button" disabled={true} testId="test-button" />);

  const button = screen.getByTestId("test-button") as HTMLButtonElement;
  expect(button).toBeInTheDocument();
  expect(button.disabled).toBe(true);
});