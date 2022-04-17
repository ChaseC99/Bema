import { render, screen } from "@testing-library/react";
import ProgressRing from "./ProgressRing";

test("renders the progress ring data correctly", async () => {
    render(<ProgressRing label="Your Progress" count={10} total={100} testId={"test-progress-ring"} />);

    const ring = screen.getByTestId("test-progress-ring");
    expect(ring.innerHTML).toMatch("10<span>%");
    expect(ring.innerHTML).toMatch("10 / 100");
    expect(ring.innerHTML).toMatch("Your Progress");
});

test("renders the progress ring data correctly when the total is 0", async () => {
    render(<ProgressRing label="Your Progress" count={0} total={0} testId={"test-progress-ring"} />);

    const ring = screen.getByTestId("test-progress-ring");
    expect(ring.innerHTML).toMatch("0<span>%");
    expect(ring.innerHTML).toMatch("0 / 0");
    expect(ring.innerHTML).toMatch("Your Progress");
});