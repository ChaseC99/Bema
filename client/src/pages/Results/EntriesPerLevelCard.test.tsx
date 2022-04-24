import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../util/testing-utils";
import EntriesPerLevelCard from "./EntriesPerLevelCard";

const data = [
    {
        entry_level: "Level 1",
        count: 10
    },
    {
        entry_level: "Level 2",
        count: 25
    },
    {
        entry_level: "Level 3",
        count: 33
    }
];

test("renders the card correctly", () => {
    renderWithRouter(<EntriesPerLevelCard entriesPerLevel={data} testId="level-card" />);

    const table = screen.getByTestId("level-card");
    expect(table.innerHTML).toMatch("Level 1");
    expect(table.innerHTML).toMatch("10");
    expect(table.innerHTML).toMatch("Level 2");
    expect(table.innerHTML).toMatch("25");
    expect(table.innerHTML).toMatch("Level 3");
    expect(table.innerHTML).toMatch("33");
});