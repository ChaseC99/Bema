import { MouseEvent } from "react";
import { render, screen } from '@testing-library/react';
import { renderWithRouter } from '../../util/testing-utils';
import ActionItem from "./ActionItem";

test("renders a button item correctly", () => {
    const clickHandler = (e: MouseEvent<HTMLSpanElement>) => {};
    render(<ActionItem role="button" action={clickHandler} text="Test Button" testId="test-action-item"/>);

    const actionItem = screen.getByTestId("test-action-item");
    expect(actionItem).toBeInTheDocument();
    expect(actionItem.innerHTML).toMatch("Test Button");
});

test("calls the button click handler on click", () => {
    const clickHandler = jest.fn();
    render(<ActionItem role="button" action={clickHandler} text="Test Button" testId="test-action-item"/>);

    const actionItem = screen.getByTestId("test-action-item");
    actionItem.click();
    expect(clickHandler.mock.calls.length).toBe(1);
})

test("renders a link item correctly", () => {
    renderWithRouter(<ActionItem role="link" action="/test" text="Test Button" testId="test-action-item"/>);

    const actionItem: HTMLAnchorElement = screen.getByTestId("test-action-item");
    expect(actionItem).toBeInTheDocument();
    expect(actionItem.innerHTML).toMatch("Test Button");
    expect(actionItem.href).toMatch("/test");
});