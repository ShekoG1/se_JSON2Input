import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JSON2Input from "../modules/json2input";

test("updates JSON data when a user changes an input", async () => {
    const testData = {
        name: "BLAH",
        phones: ["000", "000"],
        address: ""
    };

    const form = new JSON2Input(testData);

    render(form.render());

    const nameInput = screen.getByDisplayValue("BLAH"); // Ideal to find elements the way a user would interact with them rather than depending on implementation details.

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "SAMMY");

    expect(form.getData()).toEqual({
        name: "SAMMY",
        phones: ["000", "000"],
        address: ""
    });
});