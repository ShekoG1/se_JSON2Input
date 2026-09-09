import React, { useRef, useState } from "react";

class JSON2Input {
    constructor(data, disableDefaultStyling = false) {
        this.data = data;
        this.disableDefaultStyling = disableDefaultStyling;
        this.dataRef = { current: data };
    }

    render() {
        return (
            <JSON2InputRenderer
                data={this.data}
                disableDefaultStyling={this.disableDefaultStyling}
                dataRef={this.dataRef}
            />
        );
    }

    getData() {
        return this.dataRef.current;
    }
}

function JSON2InputRenderer({
    data,
    disableDefaultStyling,
    dataRef
}) {
    const [formData, setFormData] = useState(data);

    /*
     * Stores information about what an empty array should contain.
     *
     * Example:
     *
     * ["routes", 5, "parameters"]
     *
     * might point to:
     *
     * {
     *     name: "",
     *     type: "",
     *     required: ""
     * }
     */
    const arrayTemplates = useRef({});

    // Handles clicks on labels to hide/show the corresponding container for array items.
    const onClickHideContainer = (e) => {
        console.log("target:", e.target);
        console.log("currentTarget:", e.currentTarget);
        console.log("dataset:", e.currentTarget.dataset);
        console.log("elementtest:", e.currentTarget.dataset.elementtest);

        if (e.currentTarget.dataset.elementtest){

            // Change text on helper span
            const helperSpan = e.currentTarget.querySelector("span");
            if (helperSpan) {
                if (helperSpan.textContent === "Hide") {
                    helperSpan.textContent = "Show";
                } else {
                    helperSpan.textContent = "Hide";
                }
            }

            var containerToToggle = document.getElementById(`json2input-${e.currentTarget.dataset.elementtest}-array-items-container`);
            if (containerToToggle) {
                containerToToggle.style.display = containerToToggle.style.display === "none" ? "block" : "none";
            }
        }
    }

    dataRef.current = formData;

    /*
     * Create a deep clone of JSON-compatible data.
     */
    const cloneData = (value) => {
        return JSON.parse(JSON.stringify(value));
    };

    /*
     * Create a blank version of an object/value while
     * preserving its structure.
     *
     * Primitive:
     *     "hello" -> ""
     *
     * Object:
     *     { name: "John" } -> { name: "" }
     *
     * Array:
     *     [] -> []
     *
     *     [{ name: "John" }] -> []
     *
     * The array's item structure is registered separately.
     */
    const createTemplate = (value, path) => {

        // Array
        if (Array.isArray(value)) {

            if (value.length === 0) {
                return [];
            }

            const itemTemplate = createTemplate(
                value[0],
                path
            );

            arrayTemplates.current[path.join(".")] = itemTemplate;

            return [];
        }

        // Object
        if (typeof value === "object" && value !== null) {

            const result = {};

            Object.entries(value).forEach(([key, childValue]) => {

                const childPath = [...path, key];

                result[key] = createTemplate(
                    childValue,
                    childPath
                );
            });

            return result;
        }

        // Primitive
        return "";
    };

    /*
     * Determine what should be added to an array.
     */
    const createArrayItem = (array, path) => {

        // Existing items take priority.
        if (array.length > 0) {

            const previousItem = array[array.length - 1];

            return createTemplate(
                previousItem,
                [...path, array.length]
            );
        }

        /*
         * The array is empty.
         *
         * See if we previously learned what belongs
         * inside this array.
         */
        const storedTemplate =
            arrayTemplates.current[path.join(".")];

        if (storedTemplate !== undefined) {
            return cloneData(storedTemplate);
        }

        /*
         * We have no information about this array.
         * V1 assumption: text value.
         */
        return "";
    };

    /*
     * Update a value anywhere inside the JSON object.
     */
    const updateValue = (path, value) => {

        setFormData(currentData => {

            const updatedData = cloneData(currentData);

            let target = updatedData;

            /*
             * Walk the path until we reach the parent
             * of the value we want to modify.
             */
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }

            target[path[path.length - 1]] = value;

            return updatedData;
        });
    };

    /*
     * Add an item to an array.
     */
    const addArrayItem = (path) => {

        setFormData(currentData => {

            const updatedData = cloneData(currentData);

            let target = updatedData;

            /*
             * Follow the path to the array.
             */
            for (const key of path) {
                target = target[key];
            }

            /*
             * Determine what the new item should look like.
             */
            const newItem = createArrayItem(
                target,
                path
            );

            target.push(newItem);

            return updatedData;
        });
    };

    /*
     * Render an object.
     */
    const renderObject = (object, path = []) => {

        return Object.entries(object).map(([key, value]) => {

            const currentPath = [...path, key];

            // Array
            if (Array.isArray(value)) {
                return renderArray(
                    key,
                    value,
                    currentPath
                );
            }

            // Nested object
            if (
                typeof value === "object" &&
                value !== null
            ) {
                return (
                    <div
                        id={`json2input-${key}-container`}
                        // onClick={onClickHideContainer}
                        key={currentPath.join(".")}
                        {...(
                            disableDefaultStyling
                                ? {}
                                : {
                                    style: {
                                        marginLeft: "20px"
                                    }
                                }
                        )}
                    >
                        <label onClick={onClickHideContainer} data-elementtest={key} >
                            {formatLabel(key)}
                        </label>

                        <div
                            id={`json2input-${key}-object-container`}
                            // onClick={onClickHideContainer}
                            {...(
                                disableDefaultStyling
                                    ? {}
                                    : {
                                        style: {
                                            marginLeft: "20px"
                                        }
                                    }
                            )}
                        >
                            {renderObject(
                                value,
                                currentPath
                            )}
                        </div>
                    </div>
                );
            }

            // Normal value
            return renderInput(
                key,
                value,
                currentPath
            );
        });
    };

    /*
     * Render an array.
     */
    const renderArray = (key, values, path) => {

        return (
            <div
                id={`json2input-${key}-array-container`}
                // onClick={onClickHideContainer}
                key={path.join(".")}
                {...(
                    disableDefaultStyling
                        ? {}
                        : {
                            style: {
                                marginBottom: "20px"
                            }
                        }
                )}
            >
                <label onClick={onClickHideContainer} data-elementtest={key}>
                    {formatLabel(key)}
                    <span style={{ fontSize: "12px", marginLeft: "5px", cursor: "pointer", color: "blue" }}>
                        Hide
                    </span>
                </label>

                <div
                    id={`json2input-${key}-array-items-container`}
                    // onClick={onClickHideContainer}
                >
                {values.map((value, index) => {

                    const currentPath = [
                        ...path,
                        index
                    ];

                    // Nested array
                    if (Array.isArray(value)) {
                        return renderArray(
                            `${key}-${index}`,
                            value,
                            currentPath
                        );
                    }

                    // Object inside array
                    if (
                        typeof value === "object" &&
                        value !== null
                    ) {
                        return (
                            <div
                                key={currentPath.join(".")}
                                id={`json2input-${key}-object-container`}
                                // onclick={onClickHideContainer}
                            >
                                {renderObject(
                                    value,
                                    currentPath
                                )}
                            </div>
                        );
                    }

                    // Primitive inside array
                    return (
                        <input
                            key={currentPath.join(".")}
                            type="text"
                            value={value ?? ""}
                            onChange={(event) =>
                                updateValue(
                                    currentPath,
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
                    );
                })}

                    <button
                        id={`json2input-${key}-add-btn`}
                        type="button"
                        onClick={() =>
                            addArrayItem(path)
                        }
                    >
                        + Add {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>

                </div>

                {/* <button
                    id={`json2input-${key}-add-btn`}
                    type="button"
                    onClick={() =>
                        addArrayItem(path)
                    }
                >
                    + Add {key.charAt(0).toUpperCase() + key.slice(1)}
                </button> */}
            </div>
        );
    };

    /*
     * Render a normal primitive value.
     */
    const renderInput = (key, value, path) => {

        return (
            <div
                key={path.join(".")}
                id={`json2input-${key}-single-container`}
                // onClick={onClickHideContainer}
                {...(
                    disableDefaultStyling
                        ? {}
                        : {
                            style: {
                                marginBottom: "15px"
                            }
                        }
                )}
            >
                <label onClick={onClickHideContainer} data-elementtest={key}>
                    {formatLabel(key)}
                </label>

                <input
                    id={`json2input-${key}-single-input`}
                    type="text"
                    value={value ?? ""}
                    onChange={(event) =>
                        updateValue(
                            path,
                            event.target.value
                        )
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

    /*
     * Convert JSON keys into human-readable labels.
     */
    const formatLabel = (key) => {

        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/[_-]/g, " ")
            .replace(/^./, str =>
                str.toUpperCase()
            );
    };

    return renderObject(formData);
}

export default JSON2Input;