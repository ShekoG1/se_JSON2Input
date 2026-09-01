import React, { useState } from "react";

class JSON2Input {
    constructor(data, disableDefaultStyling = false) {
        this.data = data;
        this.disableDefaultStyling = disableDefaultStyling;
        this.currentData = data;
    }

    render() {
        return (
            <JSON2InputRenderer
                data={this.data}
                disableDefaultStyling={this.disableDefaultStyling}
                onDataChange={(data) => {
                    this.currentData = data;
                }}
            />
        );
    }

    getData() {
        return this.currentData;
    }
}

function JSON2InputRenderer({
    data,
    disableDefaultStyling,
    onDataChange
}) {
    const [formData, setFormData] = useState(data);

    const updateValue = (path, value) => {
        setFormData(currentData => {
            const updatedData = structuredClone(currentData);

            let target = updatedData;

            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }

            target[path[path.length - 1]] = value;

            onDataChange(updatedData);

            return updatedData;
        });
    };

    const addArrayItem = (path) => {
        setFormData(currentData => {
            const updatedData = structuredClone(currentData);

            let target = updatedData;

            for (const key of path) {
                target = target[key];
            }

            target.push("");

            onDataChange(updatedData);

            return updatedData;
        });
    };

    const renderObject = (object, path = []) => {
        return Object.entries(object).map(([key, value]) => {
            const currentPath = [...path, key];

            // Array
            if (Array.isArray(value)) {
                return renderArray(key, value, currentPath);
            }

            // Nested object
            if (typeof value === "object" && value !== null) {
                return (
                    <div
                        key={key}
                        {...(
                            disableDefaultStyling
                                ? {}
                                : { style: { marginLeft: "20px" } }
                        )}
                    >
                        <label>{formatLabel(key)}</label>

                        <div
                            {...(
                                disableDefaultStyling
                                    ? {}
                                    : { style: { marginLeft: "20px" } }
                            )}
                        >
                            {renderObject(value, currentPath)}
                        </div>
                    </div>
                );
            }

            // Normal value
            return renderInput(key, value, currentPath);
        });
    };

    const renderArray = (key, values, path) => {
        return (
            <div
                key={key}
                {...(
                    disableDefaultStyling
                        ? {}
                        : { style: { marginBottom: "20px" } }
                )}
            >
                <label>{formatLabel(key)}</label>

                {values.map((value, index) => (
                    <input
                        key={index}
                        type="text"
                        value={value}
                        onChange={(event) =>
                            updateValue(
                                [...path, index],
                                event.target.value
                            )
                        }
                        {...(
                            disableDefaultStyling
                                ? {}
                                : {
                                    style: {
                                        display: "block",
                                        marginBottom: "5px"
                                    }
                                }
                        )}
                    />
                ))}

                <button
                    id={`json2input-${key}-add-btn`}
                    type="button"
                    onClick={() => addArrayItem(path)}
                >
                    + Add
                </button>
            </div>
        );
    };

    const renderInput = (key, value, path) => {
        return (
            <div
                key={key}
                {...(
                    disableDefaultStyling
                        ? {}
                        : { style: { marginBottom: "15px" } }
                )}
            >
                <label>{formatLabel(key)}</label>

                <input
                    type="text"
                    value={value ?? ""}
                    onChange={(event) =>
                        updateValue(path, event.target.value)
                    }
                    {...(
                        disableDefaultStyling
                            ? {}
                            : {
                                style: {
                                    width: "100%",
                                    display: "block"
                                }
                            }
                    )}
                />
            </div>
        );
    };

    const formatLabel = (key) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/[_-]/g, " ")
            .replace(/^./, str => str.toUpperCase());
    };

    return renderObject(formData);
}

export default JSON2Input;