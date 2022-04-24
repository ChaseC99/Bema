import { render, screen } from "@testing-library/react";
import ProgressBar from "./ProgressBar";

test("renders the progress bar data correctly", async () => {
    render(<ProgressBar count={10} total={100} testId={"test-progress-bar"} />);

    const bar = screen.getByTestId("test-progress-bar");
    expect(bar.innerHTML).toMatch("10%");
});

test("renders the progress bar data correctly when the total is 0", async () => {
    render(<ProgressBar count={10} total={0} testId={"test-progress-bar"} />);

    const bar = screen.getByTestId("test-progress-bar");
    expect(bar.innerHTML).toMatch("0%");
});