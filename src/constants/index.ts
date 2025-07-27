// constants.ts
export const BOARD_SIZE = 10;
export const BATTLESHIP_LENGTH = 5;
export const DESTROYER_LENGTH = 4;

export const SHIP_LENGTHS = [
	BATTLESHIP_LENGTH,
	DESTROYER_LENGTH,
	DESTROYER_LENGTH,
];

export const VALID_COORDINATE_PATTERN = /^[A-J](10|[1-9])$/;

export const DIRECTIONS = [
	{ row: -1, col: 0 }, // up
	{ row: 1, col: 0 }, // down
	{ row: 0, col: -1 }, // left
	{ row: 0, col: 1 }, // right
] as const;

export const CELL_VALUES = {
	EMPTY: 0,
	SHIP: 1,
	MISS: 2,
	HIT: 3,
} as const;

export const GAME_CONFIG = {
	MAX_SHIP_PLACEMENT_ATTEMPTS: 1000,
	COMPUTER_ATTACK_DELAY: 1500,
	SNACKBAR_AUTO_HIDE_DURATION: 6000,
} as const;
