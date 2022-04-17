import { MouseEvent } from "react";
import { render, screen } from '@testing-library/react';
import { renderWithRouter } from '../../util/testing-utils';
import ActionMenu from "./ActionMenu";
import { Action } from ".";

const actions: Action[] = [
    {
        role: "link",
        action: "/test",
        text: "Action 1"
    },
    {
        role: "link",
        action: "/test-2",
        text: "Action 2"
    }
];

test("renders the action icon", () => {
    renderWithRouter(<ActionMenu actions={actions} testId="test-action-menu" />);

    const actionMenu = screen.getByTestId("test-action-menu");
    expect(actionMenu.innerHTML).toMatch("<i");
});

test("renders the action items", () => {
    renderWithRouter(<ActionMenu actions={actions} testId="test-action-menu" />);

    const actionMenu = screen.getByTestId("test-action-menu");
    expect(actionMenu.innerHTML).toMatch("Action 1");
    expect(actionMenu.innerHTML).toMatch("/test");
    expect(actionMenu.innerHTML).toMatch("Action 2");
    expect(actionMenu.innerHTML).toMatch("/test-2");
});

test("initially hides the action menu items", () => {
    renderWithRouter(<ActionMenu actions={actions} testId="test-action-menu" />);

    const actionMenu = screen.getByTestId("test-action-menu");
    const menuItems = actionMenu?.firstChild?.firstChild?.nextSibling;

    expect(menuItems).toHaveProperty("hidden", true);
})

test("displays the action menu after clicking the action icon", () => {
    renderWithRouter(<ActionMenu actions={actions} testId="test-action-menu" />);

    const actionMenu = screen.getByTestId("test-action-menu");
    const icon = actionMenu?.firstChild?.firstChild as HTMLElement;
    
    icon.click();

    const menuItems = actionMenu?.firstChild?.firstChild?.nextSibling;
    expect(menuItems).toHaveProperty("hidden", false);
});