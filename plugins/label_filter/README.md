## label_filter 0.1.0

by boi123212321

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/label_filter.js)

Filter labels returned by other plugins

### Arguments

| Name      | Type     | Required | Description       |
| --------- | -------- | -------- | ----------------- |
| whitelist | String[] | false    | Labels to include |
| blacklist | String[] | false    | Labels to exclude |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "label_filter": {
        "path": "./plugins/label_filter.js",
        "args": {
          "whitelist": [],
          "blacklist": []
        }
      }
    },
    "events": {
      "actorCreated": [
        "label_filter"
      ],
      "actorCustom": [
        "label_filter"
      ],
      "sceneCreated": [
        "label_filter"
      ],
      "sceneCustom": [
        "label_filter"
      ],
      "studioCreated": [
        "label_filter"
      ],
      "studioCustom": [
        "label_filter"
      ]
    }
  }
}
---
```

`config.yaml`

```yaml
---
plugins:
  register:
    label_filter:
      path: ./plugins/label_filter.js
      args:
        whitelist: []
        blacklist: []
  events:
    actorCreated:
      - label_filter
    actorCustom:
      - label_filter
    sceneCreated:
      - label_filter
    sceneCustom:
      - label_filter
    studioCreated:
      - label_filter
    studioCustom:
      - label_filter

---

```
