import {Controller} from "../Controller/Controller";

test("returns correct class name", () => {
    let c = new Controller();
    expect(c.className()).toBe("Controller");
})
