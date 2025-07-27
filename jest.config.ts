export default {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	transform: {
		"^.+\\.(ts|tsx)$": [
			"ts-jest",
			{
				tsconfig: {
					jsx: "react-jsx",
				},
			},
		],
	},
	setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
	testMatch: ["**/__tests__/**/*.(spec|test).[jt]s?(x)"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
};
