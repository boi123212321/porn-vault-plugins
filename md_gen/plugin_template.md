## {{ name }} {{ version }}

by {{ authors }}

{{ description }}
{{#if docs}}

### Documentation

{{ docs }}
{{/if}}
{{#if hasArgs}}
### Arguments

{{ argsTable }}
{{/if}}
### Example installation

```json
{
  "PLUGINS": {
    "{{ name }}": {
      "path": "./plugins/{{ name }}/main.js",
      "args": {}
    }
  }
}
```

```yaml
---
PLUGINS:
  "{{ name }}":
    path: "./plugins/{{ name }}/main.js"
    args: {}
```
