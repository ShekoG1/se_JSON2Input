import React from "react";

class JSON2Input {
    constructor(data,disableDefaultStyling=false) {
        this.data = data;
        this.disableDefaultStyling = disableDefaultStyling;
    }

    render() {
        return this.renderObject(this.data);
    }

    renderObject(object) {
        return Object.entries(object).map(([key, value]) => {
            // Array
            if (Array.isArray(value)) {
                return this.renderArray(key, value);
            }

            // Nested object
            if (typeof value === "object" && value !== null) {
                return (
                    <div {...(this.disableDefaultStyling ? {} : { style: { marginLeft: "20px" } })} key={key}>
                        <label>{this.formatLabel(key)}</label>
                        <div {...(this.disableDefaultStyling ? {} : { style: { marginLeft: "20px" } })}>
                            {this.renderObject(value)}
                        </div>
                    </div>
                );
            }

            // Normal value
            return this.renderInput(key, value);
        });
    }

    renderArray(key, values) {
        return (
            <div key={key} {...(this.disableDefaultStyling ? {} : { style: { marginBottom: "20px" } })}>
                <label>{this.formatLabel(key)}</label>

                {values.map((value, index) => (
                    <input
                        key={index}
                        type="text"
                        defaultValue={value}
                        {...(this.disableDefaultStyling ? {} : { style: { display: "block", marginBottom: "5px" } })}
                    />
                ))}

                <button id={`json2input-${key}-add-btn`} type="button">
                    + Add
                </button>
            </div>
        );
    }

    renderInput(key, value) {
        return (
            <div key={key} {...(this.disableDefaultStyling ? {} : { style: { marginBottom: "15px" } })}>
                <label>{this.formatLabel(key)}</label>

                <input
                    {...(this.disableDefaultStyling ? {} : { style: { width: "100%", display: "block" } })}
                    type="text"
                    defaultValue={value}
                />
            </div>
        );
    }

    formatLabel(key) {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/[_-]/g, " ")
            .replace(/^./, str => str.toUpperCase());
    }
}

export default JSON2Input;