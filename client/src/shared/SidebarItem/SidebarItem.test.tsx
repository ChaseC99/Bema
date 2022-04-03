import { renderWithRouter } from "../../util/testing-utils";
import { screen } from '@testing-library/react';
import SidebarItem from "./SidebarItem";

test("renders the sidebar item correctly", () => {
  renderWithRouter(<SidebarItem to="/test" text="Test Item" testId="test-item" />);

  const item = screen.getByTestId("test-item");
  expect(item.innerHTML).toMatch("Test Item");
  expect(item.classList).not.toContain("active");
});

test("renders active tabs correctly", () => {
  renderWithRouter(<SidebarItem to="/test" text="Test Item" testId="test-item" />, ["/test"]);

  const item = screen.getByTestId("test-item");
  expect(item.innerHTML).toMatch("Test Item");
  expect(item.classList).toContain("active");
});