// src/modules/json2input.jsx
import React, { useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var JSON2Input = class {
  constructor(data, disableDefaultStyling = false) {
    this.data = data;
    this.disableDefaultStyling = disableDefaultStyling;
    this.dataRef = { current: data };
  }
  render() {
    return /* @__PURE__ */ jsx(
      JSON2InputRenderer,
      {
        data: this.data,
        disableDefaultStyling: this.disableDefaultStyling,
        dataRef: this.dataRef
      }
    );
  }
  getData() {
    return this.dataRef.current;
  }
};
function JSON2InputRenderer({
  data,
  disableDefaultStyling,
  dataRef
}) {
  const [formData, setFormData] = useState(data);
  const arrayTemplates = useRef({});
  const onClickHideContainer = (e) => {
    console.log("onClickHideContainer", e.target);
  };
  dataRef.current = formData;
  const cloneData = (value) => {
    return JSON.parse(JSON.stringify(value));
  };
  const createTemplate = (value, path) => {
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
    return "";
  };
  const createArrayItem = (array, path) => {
    if (array.length > 0) {
      const previousItem = array[array.length - 1];
      return createTemplate(
        previousItem,
        [...path, array.length]
      );
    }
    const storedTemplate = arrayTemplates.current[path.join(".")];
    if (storedTemplate !== void 0) {
      return cloneData(storedTemplate);
    }
    return "";
  };
  const updateValue = (path, value) => {
    setFormData((currentData) => {
      const updatedData = cloneData(currentData);
      let target = updatedData;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = value;
      return updatedData;
    });
  };
  const addArrayItem = (path) => {
    setFormData((currentData) => {
      const updatedData = cloneData(currentData);
      let target = updatedData;
      for (const key of path) {
        target = target[key];
      }
      const newItem = createArrayItem(
        target,
        path
      );
      target.push(newItem);
      return updatedData;
    });
  };
  const renderObject = (object, path = []) => {
    return Object.entries(object).map(([key, value]) => {
      const currentPath = [...path, key];
      if (Array.isArray(value)) {
        return renderArray(
          key,
          value,
          currentPath
        );
      }
      if (typeof value === "object" && value !== null) {
        return /* @__PURE__ */ jsxs(
          "div",
          {
            id: `json2input-${key}-container`,
            onClick: onClickHideContainer,
            ...disableDefaultStyling ? {} : {
              style: {
                marginLeft: "20px"
              }
            },
            children: [
              /* @__PURE__ */ jsx("label", { "data-key": key, children: formatLabel(key) }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  id: `json2input-${key}-object-container`,
                  onClick: onClickHideContainer,
                  ...disableDefaultStyling ? {} : {
                    style: {
                      marginLeft: "20px"
                    }
                  },
                  children: renderObject(
                    value,
                    currentPath
                  )
                }
              )
            ]
          },
          currentPath.join(".")
        );
      }
      return renderInput(
        key,
        value,
        currentPath
      );
    });
  };
  const renderArray = (key, values, path) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        id: `json2input-${key}-array-container`,
        onClick: onClickHideContainer,
        ...disableDefaultStyling ? {} : {
          style: {
            marginBottom: "20px"
          }
        },
        children: [
          /* @__PURE__ */ jsx("label", { children: formatLabel(key) }),
          values.map((value, index) => {
            const currentPath = [
              ...path,
              index
            ];
            if (Array.isArray(value)) {
              return renderArray(
                `${key}-${index}`,
                value,
                currentPath
              );
            }
            if (typeof value === "object" && value !== null) {
              return /* @__PURE__ */ jsx(
                "div",
                {
                  id: `json2input-${key}-object-container`,
                  onclick: onClickHideContainer,
                  children: renderObject(
                    value,
                    currentPath
                  )
                },
                currentPath.join(".")
              );
            }
            return /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: value ?? "",
                onChange: (event) => updateValue(
                  currentPath,
                  event.target.value
                ),
                ...disableDefaultStyling ? {} : {
                  style: {
                    display: "block",
                    marginBottom: "5px"
                  }
                }
              },
              currentPath.join(".")
            );
          }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              id: `json2input-${key}-add-btn`,
              type: "button",
              onClick: () => addArrayItem(path),
              children: [
                "+ Add ",
                key.charAt(0).toUpperCase() + key.slice(1)
              ]
            }
          )
        ]
      },
      path.join(".")
    );
  };
  const renderInput = (key, value, path) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        id: `json2input-${key}-single-container`,
        onClick: onClickHideContainer,
        ...disableDefaultStyling ? {} : {
          style: {
            marginBottom: "15px"
          }
        },
        children: [
          /* @__PURE__ */ jsx("label", { "data-key": key, children: formatLabel(key) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: `json2input-${key}-single-input`,
              type: "text",
              value: value ?? "",
              onChange: (event) => updateValue(
                path,
                event.target.value
              ),
              ...disableDefaultStyling ? {} : {
                style: {
                  width: "100%",
                  display: "block"
                }
              }
            }
          )
        ]
      },
      path.join(".")
    );
  };
  const formatLabel = (key) => {
    return key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(
      /^./,
      (str) => str.toUpperCase()
    );
  };
  return renderObject(formData);
}
var json2input_default = JSON2Input;
export {
  json2input_default as JSON2Input
};
//# sourceMappingURL=json2input.js.map
