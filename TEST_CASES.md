# JSON Test Cases

Here are some JSON examples to test the application, ranging from simple to complex.

## Level 1: Simple (Easy)
A flat object with basic data types. Good for testing basic formatting and editing.

```json
{
  "name": "Payload.cool",
  "version": 1,
  "active": true,
  "description": "A privacy-first JSON tool",
  "tags": null
}
```

## Level 2: Nested & Arrays (Medium)
Contains arrays and nested objects. Good for testing Tree View and CSV conversion (arrays).

```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "roles": ["admin", "editor"]
    },
    {
      "id": 2,
      "name": "Bob Jones",
      "email": "bob@example.com",
      "roles": ["viewer"],
      "settings": {
        "theme": "dark",
        "notifications": false
      }
    }
  ],
  "metadata": {
    "total_users": 2,
    "generated_at": "2023-10-27T10:00:00Z"
  }
}
```

## Level 3: Deeply Nested & Mixed Types (Hard)
Complex structure with mixed types, unicode characters, and deep nesting. Good for testing Tree View performance and layout resizing.

```json
{
  "project": {
    "id": "prj_12345",
    "name": "Super App 🚀",
    "i18n": {
      "en": { "greeting": "Hello" },
      "zh": { "greeting": "你好" },
      "jp": { "greeting": "こんにちは" },
      "emoji": "🎉🔥💻"
    },
    "config": {
      "database": {
        "host": "localhost",
        "port": 5432,
        "adapters": [
          { "type": "primary", "timeout": 5000 },
          { "type": "replica", "timeout": 10000, "readonly": true }
        ]
      },
      "experiments": {
        "feature_flags": {
          "new_ui": true,
          "beta_access": null,
          "rate_limit": 100.5
        }
      }
    }
  },
  "logs": [
    "Started application...",
    "Connected to DB",
    { "level": "warn", "msg": "High latency detected", "code": 404 }
  ]
}
```

## Level 4: Edge Cases (Tricky)
Valid JSON but with structures that might challenge some parsers or visualizers.

```json
[
  {},
  [],
  {
    "": "empty key",
    "   spaced key   ": "value",
    "null_value": null,
    "boolean_false": false,
    "number_zero": 0,
    "nested_empty": { "arr": [{}, []] }
  }
]
```

## Level 5: Invalid JSON (Error Testing)
Copy this to test error handling. The Format/Minify buttons should be disabled.

```json
{
  "name": "Broken JSON",
  "missing_comma": true
  "unclosed_string": "oops
}
```

## Level 6: Schema Validation (Feature Testing)

1. Click **Schema** in the toolbar.
2. Select **Presets** -> **package.json**.
3. Paste the following invalid `package.json` content:

```json
{
  "name": "my-app",
  "version": "not-a-semver",
  "scripts": "should-be-object",
  "dependencies": {
    "react": 18
  }
}
```

**Expected Result:**
- A red **Validation Errors** panel appears at the bottom.
- Errors listed:
  - `$.version`: Pattern mismatch (not semver)
  - `$.scripts`: Expected object, got string
  - `$.dependencies.react`: Expected string, got number
- Click on `$.scripts` -> Editor selects `"should-be-object"`.
- Switch to **Graph View** -> The nodes for `scripts` and `react` should be highlighted in red.
