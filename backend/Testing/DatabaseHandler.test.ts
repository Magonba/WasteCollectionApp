import { DatabaseHandler } from "../Database/DatabaseHandler";

describe("DatabaseHandler Tests", () => {
    test("DatabaseHandler is a Class/Function", () => {
        const isClassOrFunction = DatabaseHandler instanceof Function;
        expect(isClassOrFunction).toBe(true);
    });
});
