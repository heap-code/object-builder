import { JestConfigWithTsJest } from "ts-jest";

export default {
	collectCoverageFrom: [
		"<rootDir>/src/**/*.ts",
		"!<rootDir>/src/**/index.ts",
	],
	coverageThreshold: {
		global: { branches: 80, functions: 80, lines: 80, statements: 80 },
	},
	moduleFileExtensions: ["js", "ts"],
	testPathIgnorePatterns: ["/node_modules/", "/dist/"],
	transform: {
		"^.+\\.[tj]s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.spec.json",
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$)"],
	watchPlugins: [
		"jest-watch-typeahead/filename",
		"jest-watch-typeahead/testname",
	],
} satisfies JestConfigWithTsJest;
