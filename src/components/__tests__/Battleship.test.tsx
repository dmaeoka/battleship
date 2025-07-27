import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Battleship from "../Battleship";

describe("Battleship component - extended tests", () => {
	it("renders player and computer game boards", () => {
		render(<Battleship />);
		expect(screen.getByTestId("player-board")).not.toBeNull();
		expect(screen.getByTestId("computer-board")).not.toBeNull();
	});

	it("shows error snackbar when invalid input is submitted", async () => {
		render(<Battleship />);
		const input = screen.getByRole("textbox");
		const button = screen.getByRole("button", { name: /attack/i });

		await userEvent.type(input, "INVALID");
		await userEvent.click(button);

		expect(await screen.findByText(/invalid coordinates/i)).not.toBeNull();
	});

	it("accepts coordinate input", async () => {
		render(<Battleship />);
		const input = screen.getByRole("textbox");
		await userEvent.type(input, "B4");
		expect((input as HTMLInputElement).value).toBe("B4");
	});
});
