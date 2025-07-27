import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameBoard, CoordinateInput } from "../components";
import { CELL_VALUES } from "../../constants";
import type { Board } from "../../types";

describe("GameBoard", () => {
	const mockBoard: Board = Array.from({ length: 10 }, () =>
		Array(10).fill(CELL_VALUES.EMPTY),
	);

	it("renders the board title", () => {
		render(<GameBoard board={mockBoard} title="Test Board" />);
		expect(screen.getByText("Test Board")).toBeInTheDocument();
	});

	it("renders 10x10 cells", () => {
		render(<GameBoard board={mockBoard} title="Test Board" />);
		expect(document.querySelectorAll(".cell").length).toBe(100);
	});

	it("highlights target cell if matched", () => {
		render(
			<GameBoard
				board={mockBoard}
				title="Computer"
				isComputerBoard
				targetCoordinates={{ row: 0, col: 1 }}
			/>,
		);
		const cells = document.querySelectorAll(".cell");
		const target = Array.from(cells).find((cell) =>
			cell.classList.contains("target"),
		);
		expect(target).toBeTruthy();
	});
});

describe("CoordinateInput", () => {
	it("renders input and button", () => {
		render(
			<CoordinateInput
				inputValue=""
				onInputChange={() => {}}
				onSubmit={() => {}}
			/>,
		);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /attack/i }),
		).toBeInTheDocument();
	});

	it("triggers input change", async () => {
		const handleChange = jest.fn();
		render(
			<CoordinateInput
				inputValue=""
				onInputChange={handleChange}
				onSubmit={() => {}}
			/>,
		);
		await userEvent.type(screen.getByRole("textbox"), "A5");
		expect(handleChange).toHaveBeenCalled();
	});

	it("calls onSubmit when form is submitted", () => {
		const handleSubmit = jest.fn((e) => e.preventDefault());
		render(
			<CoordinateInput
				inputValue=""
				onInputChange={() => {}}
				onSubmit={handleSubmit}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /attack/i }));
		expect(handleSubmit).toHaveBeenCalled();
	});
});
