# JSON2Input

JSON2Input is a React component that dynamically converts a JSON object into an editable set of HTML inputs.

The goal of JSON2Input is simple:

> **Give JSON2Input a JSON object, and let it build the form for you.**

Instead of manually creating a form for every property in a JSON structure, JSON2Input recursively walks the data, creates the appropriate inputs, tracks changes, supports nested objects and arrays, and returns the entire updated JSON object.

JSON2Input is being developed with a "make life easier" philosophy. It is intended to handle the repetitive work of creating and maintaining dynamic JSON-backed forms while still keeping the resulting data predictable and accessible to the developer.

---

## Current Status

**Version:** V1 development

JSON2Input currently supports:

- Primitive JSON values
- Nested objects
- Arrays of primitive values
- Arrays of objects
- Nested objects inside arrays
- Nested arrays
- Dynamically adding new array items
- Dynamically adding new objects to arrays
- Recursive structure detection
- Path-based updates
- Retrieving the complete updated JSON object
- Optional default styling

The project is currently being prepared for publication as an npm package.

---

## Why JSON2Input?

Building a form from a JSON object is usually straightforward until the JSON becomes dynamic.

For example:

```js
const data = {
    name: "BLAH",
    phones: ["000", "000"],
    address: ""
};
```

A traditional React implementation requires manually creating inputs for:

- `name`
- every item in `phones`
- `address`

That becomes considerably more complicated when the JSON contains nested objects and arrays of objects:

```js
const data = {
    name: "user/delete",
    parameters: [
        {
            name: "email",
            type: "string",
            required: true
        },
        {
            name: "token",
            type: "string",
            required: true
        }
    ],
    conditions: [
        {
            field: "uid",
            operator: "=",
            value: "$email"
        }
    ]
};
```

JSON2Input handles the recursive rendering for you.

---
## Styling

JSON2Input provides minimal default styling so generated forms are immediately usable, while still giving the consuming application full control over presentation.

By default, JSON2Input applies basic inline styling to generated containers and inputs. If you want to handle all styling yourself, pass true as the second constructor argument:

const form = new JSON2Input(data, true);

This disables JSON2Input's default styling without affecting the generated structure or functionality.

### Unique Container IDs

JSON2Input also assigns predictable IDs to generated containers and inputs, making it possible to target specific elements with your own CSS or JavaScript.

Examples include:
```
json2input-name-single-container
json2input-name-single-input
json2input-phones-array-container
json2input-phones-add-btn
json2input-address-container
```

Nested objects and arrays also receive dedicated container IDs based on their JSON keys.

This gives developers two options:

```
// Use JSON2Input's basic styling
const form = new JSON2Input(data);
```

or:

```
// Disable default styling and style everything yourself
const form = new JSON2Input(data, true);
```

The intention is that **JSON2Input** handles the JSON and form logic, not dictate how your application should look.

---
# Installation

JSON2Input is currently under development and has not yet been published to npm.

Once published, installation will be:

```bash
npm install json2input
```

For development directly from this repository:

```bash
git clone <repository-url>
cd <repository-directory>
npm install
npm start
```

---

# Basic Usage

Import JSON2Input:

```js
import JSON2Input from "./modules/json2input";
```

Create your JSON data:

```js
const testData = {
    name: "BLAH",
    phones: ["000", "000"],
    address: ""
};
```

Create the JSON2Input instance:

```js
const form = new JSON2Input(testData);
```

Render it:

```jsx
function App() {
    const testData = {
        name: "BLAH",
        phones: ["000", "000"],
        address: ""
    };

    const form = new JSON2Input(testData);

    return (
        <div>
            {form.render()}
        </div>
    );
}

export default App;
```

JSON2Input will generate inputs corresponding to the JSON structure.

---

# Retrieving Updated Data

JSON2Input maintains the latest form state internally.

Use:

```js
form.getData()
```

to retrieve the complete updated JSON object.

For example:

```jsx
<button
    type="button"
    onClick={() => {
        console.log(form.getData());
    }}
>
    Get Data
</button>
```

If the original data is:

```js
const data = {
    name: "BLAH",
    phones: ["000", "000"],
    address: ""
};
```

and the user changes the name to:

```text
John
```

and the first phone number to:

```text
555-1234
```

then:

```js
form.getData();
```

returns:

```js
{
    name: "John",
    phones: ["555-1234", "000"],
    address: ""
}
```

JSON2Input returns the **entire JSON object**, not just the value that changed.

---

# How JSON2Input Works

JSON2Input recursively walks the supplied JSON object.

At a high level:

```text
JSON
 |
 +-- primitive
 |     |
 |     +-- text input
 |
 +-- object
 |     |
 |     +-- recursively render its properties
 |
 +-- array
       |
       +-- inspect its items
       |
       +-- render each item
       |
       +-- provide + Add
```

The renderer determines whether each value is:

```js
Array.isArray(value)
```

an object:

```js
typeof value === "object" && value !== null
```

or a primitive value.

This allows the same renderer to work with JSON structures of different shapes.

---

# Paths

One of the most important concepts in JSON2Input is the **path**.

A path represents the exact location of a value inside the JSON object.

For example:

```js
{
    address: {
        city: "Austin"
    }
}
```

The path to `city` is:

```js
["address", "city"]
```

For arrays, indexes are included in the path.

For example:

```js
{
    phones: [
        "111",
        "222"
    ]
}
```

The paths are:

```js
["phones", 0]
["phones", 1]
```

A more complex example:

```js
{
    routes: [
        {
            parameters: [
                {
                    name: "email"
                }
            ]
        }
    ]
}
```

The path to `name` is:

```js
["routes", 0, "parameters", 0, "name"]
```

Paths allow JSON2Input to update the exact value that the user changed without needing to know anything about the specific JSON structure.

---

# Updating Values

When an input changes, JSON2Input receives:

```text
path + new value
```

For example:

```js
path = ["routes", 0, "parameters", 0, "name"];
value = "username";
```

JSON2Input follows the path through the current JSON data and updates the appropriate property.

Conceptually:

```text
formData
   |
   +-- routes
        |
        +-- [0]
             |
             +-- parameters
                  |
                  +-- [0]
                       |
                       +-- name
```

The resulting JSON is then stored as the latest form state.

---

# Arrays

Arrays receive special handling.

For example:

```js
const data = {
    names: ["John", "Hammond"]
};
```

JSON2Input renders:

```text
Names

[ John     ]
[ Hammond  ]

[ + Add ]
```

Clicking `+ Add` creates another input:

```text
Names

[ John     ]
[ Hammond  ]
[          ]

[ + Add ]
```

The resulting JSON becomes:

```js
{
    names: [
        "John",
        "Hammond",
        ""
    ]
}
```

---

# Arrays of Objects

This is where JSON2Input becomes particularly useful.

Consider:

```js
const data = {
    conditions: [
        {
            field: "uid",
            operator: "=",
            value: "$email"
        }
    ]
};
```

The array does not contain simple text values. It contains objects.

JSON2Input recognizes this and renders the object's properties instead of attempting to place the entire object into a text input.

The structure is effectively:

```text
Conditions

Field
[ uid ]

Operator
[ = ]

Value
[ $email ]

[ + Add ]
```

When another condition is added, JSON2Input creates a new object with the same structure:

```js
{
    field: "",
    operator: "",
    value: ""
}
```

The resulting JSON becomes:

```js
{
    conditions: [
        {
            field: "uid",
            operator: "=",
            value: "$email"
        },
        {
            field: "",
            operator: "",
            value: ""
        }
    ]
}
```

---

# How Dynamic Object Creation Works

JSON2Input does not need to know what an object represents.

It does not need special logic such as:

```js
if (key === "routes") {
    ...
}
```

Instead, when an item is added to an array, JSON2Input looks at the existing structure.

If an array already contains an item, the previous item can be used as the structural template for the new item.

For example:

```js
routes[4]
```

exists.

The user clicks `+ Add`, so JSON2Input creates:

```js
routes[5]
```

using the structure of:

```js
routes[4]
```

The values are cleared while the structure is preserved.

For example:

```js
{
    name: "user/delete",
    parameters: [
        {
            name: "email",
            type: "string"
        }
    ]
}
```

becomes:

```js
{
    name: "",
    parameters: [
        {
            name: "",
            type: ""
        }
    ]
}
```

This allows deeply nested structures to remain intact when new items are added.

---

# Nested Arrays

JSON2Input also handles arrays nested inside other structures.

For example:

```js
{
    groups: [
        {
            name: "Administrators",
            members: [
                "John",
                "Jane"
            ]
        }
    ]
}
```

Paths allow the renderer to distinguish between:

```js
["groups", 0, "name"]
```

and:

```js
["groups", 0, "members", 0]
```

The same recursive rendering and update system is used regardless of how deeply the data is nested.

---

# Empty Arrays

There is an unavoidable ambiguity with an empty array.

For example:

```js
{
    something: []
}
```

The JSON itself does not tell us whether the array is intended to contain:

```js
["one", "two"]
```

or:

```js
[
    {
        name: "John"
    }
]
```

For V1, JSON2Input uses a simple rule:

> **If there is no existing item from which to determine the structure, assume the new item is a text value.**

Therefore:

```js
{
    something: []
}
```

followed by `+ Add` becomes:

```js
{
    something: [""]
}
```

This behavior may evolve in a future version as more explicit schema support is introduced.

---

# Template Tracking

When JSON2Input encounters an object containing an array, it remembers the structure that belongs inside that array.

For example:

```js
{
    parameters: [
        {
            name: "email",
            type: "string",
            required: true
        }
    ]
}
```

JSON2Input can remember that:

```text
parameters
    |
    +-- array
          |
          +-- object
                |
                +-- name
                +-- type
                +-- required
```

This becomes important when a new parent object is added.

For example, when a new route is created:

```js
routes[5]
```

its nested:

```js
parameters
```

array can still retain knowledge that its items are objects.

This allows the user to subsequently click:

```text
Parameters
+ Add
```

and receive the correct object fields rather than a single `[object Object]` text input.

---

# Default Styling

JSON2Input includes basic default styling to make the generated form usable immediately.

By default:

```js
const form = new JSON2Input(data);
```

will apply basic inline styles to generated elements.

To disable the default styling:

```js
const form = new JSON2Input(
    data,
    true
);
```

The second constructor argument is:

```js
disableDefaultStyling
```

Example:

```js
const form = new JSON2Input(
    testData,
    true
);
```

This allows the application using JSON2Input to completely control the styling.

---

# Constructor

## `new JSON2Input(data, disableDefaultStyling)`

### `data`

The JSON object that should be converted into inputs.

Example:

```js
const data = {
    name: "John",
    phones: ["111", "222"]
};
```

### `disableDefaultStyling`

Optional boolean.

Default:

```js
false
```

Set to `true` to prevent JSON2Input from applying its built-in inline styles.

---

# Methods

## `render()`

Renders the JSON data as React elements.

Example:

```jsx
{form.render()}
```

---

## `getData()`

Returns the latest complete JSON object represented by the form.

Example:

```js
const data = form.getData();

console.log(data);
```

The returned object represents the entire current form state.

---

# React State

Internally, JSON2Input maintains the current form data using React state.

Conceptually:

```text
Initial JSON
     |
     v
React state
     |
     v
Rendered inputs
     |
     v
User changes input
     |
     v
Path + new value
     |
     v
Updated JSON
     |
     v
React state
```

The latest state is exposed through:

```js
form.getData()
```

This keeps the implementation simple for applications that primarily want JSON2Input to handle the form state automatically.

---

# Testing

The project uses:

- Jest
- React Testing Library
- `@testing-library/user-event`

Run the test suite with:

```bash
npm test
```

Tests currently live under:

```text
src/tests/
```

The test suite is intended to verify behavior from the user's perspective, particularly:

- Inputs render from JSON
- Input changes update the correct JSON value
- Array values update correctly
- Objects inside arrays are rendered correctly
- New array items are created correctly
- Nested structures retain their expected shape
- `getData()` returns the expected complete JSON object

---

# Example Project Structure

A development project currently follows this general structure:

```text
se_json2input/
|
├── public/
|
├── src/
│   ├── data/
│   │   └── config.json
│   │
│   ├── modules/
│   │   └── json2input.js
│   │
│   ├── tests/
│   │   └── json2input.test.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── index.js
│
├── package.json
└── README.md
```

---

# Example: Complex JSON

JSON2Input is designed to work with structures such as:

```js
const config = {
    database: {
        host: "localhost",
        port: 5432,
        user: "oneapi",
        password: "securepassword",
        name: "mydatabase"
    },

    routes: [
        {
            name: "user/get",
            action: "getByField",
            table: "user",
            auth_required: false,
            parameters: [
                {
                    name: "email",
                    type: "string",
                    required: true
                }
            ]
        },

        {
            name: "user/delete",
            action: "deleteByConditions",
            table: "user",
            auth_required: true,
            parameters: [
                {
                    name: "email",
                    type: "string",
                    required: true,
                    table_field: "uid"
                }
            ],
            conditions: [
                {
                    field: "uid",
                    operator: "=",
                    value: "$email"
                }
            ]
        }
    ]
};
```

The important point is that JSON2Input does not need to know what a `database`, `route`, `parameter`, or `condition` is.

It only needs to understand the JSON structure.

---

# Design Philosophy

JSON2Input is intentionally designed around a few principles.

## 1. JSON is the source of structure

The component should not require developers to manually define every input.

The JSON structure determines what gets rendered.

## 2. Paths identify data

Every input has a path back to its location in the JSON.

This allows updates to remain generic and independent of the actual property names.

## 3. Recursive rendering

Objects and arrays can contain other objects and arrays.

The renderer therefore needs to recursively process the data instead of making assumptions about its depth.

## 4. Add operations preserve structure

When the user adds an item to an array, JSON2Input attempts to determine what that item should look like based on existing data and remembered templates.

## 5. Keep application code simple

The application should primarily need to do this:

```js
const form = new JSON2Input(data);
```

and later:

```js
const updatedData = form.getData();
```

The repetitive form-management work should happen inside JSON2Input.

---

# Current Limitations

JSON2Input is currently a V1 implementation.

Known limitations include:

### Input types

At the moment, generated values are primarily rendered as:

```html
<input type="text">
```

This means values such as:

```js
true
false
123
```

may currently be represented as strings after user interaction.

Future versions may infer and support appropriate input types such as:

- `text`
- `number`
- `checkbox`
- `date`
- `select`

and potentially allow custom input rendering.

### Empty arrays

An empty array does not contain enough information to determine its intended item type.

V1 therefore assumes a text value unless structural information has previously been recorded.

### JSON-compatible data

The current implementation is designed around JSON-compatible values.

The cloning strategy currently uses:

```js
JSON.parse(JSON.stringify(value))
```

so JavaScript-specific values such as functions, class instances, `Date` objects, `Map`, and `Set` are outside the intended data model.

### Styling

Default styling is intentionally minimal.

The styling system is expected to become more flexible as the package develops.

---

# Roadmap

The project is currently focused on getting a solid V1 implementation published and usable.

Potential future improvements include:

- [ ] Publish to npm
- [ ] Publish the project to GitHub
- [ ] Add package documentation
- [ ] Expand automated test coverage
- [ ] Better boolean handling
- [ ] Automatic number/type detection
- [ ] Support for custom input types
- [ ] Custom renderers
- [ ] Custom styling
- [ ] Remove array items
- [ ] Reorder array items
- [ ] Better handling of empty arrays
- [ ] More sophisticated schema support
- [ ] TypeScript support
- [ ] Production build/package configuration
- [ ] More comprehensive examples
- [ ] CI/CD testing

---

# Development

Install dependencies:

```bash
npm install
```

Start the development application:

```bash
npm start
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

---

# Contributing

JSON2Input is being developed as an open-source project.

Contributions, bug reports, feature requests, and suggestions are welcome.

When contributing, please consider whether a proposed change keeps the component generic.

For example, adding logic specifically for:

```js
routes
```

would make JSON2Input less reusable.

Prefer logic based on:

```text
value type
path
array structure
object structure
```

rather than specific application property names.

---

# License

License information will be added before the first public npm release.

---

# Project Goal

JSON2Input exists to make one particular problem easier:

> **Turning arbitrary JSON structures into usable React forms without manually building every input.**

The long-term goal is to make JSON2Input flexible enough to handle complex real-world JSON while keeping the developer-facing API extremely simple.

Ideally, the common case should remain:

```js
const form = new JSON2Input(data);
```

Render it:

```jsx
{form.render()}
```

Then retrieve the user's changes:

```js
const updatedData = form.getData();
```

The complexity should live inside JSON2Input — not inside the application using it.
