## adultempire 0.5.0

by boi123212321

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/adultempire.js)

Scrape data from adultempire

### Arguments

| Name | Type    | Required | Description                    |
| ---- | ------- | -------- | ------------------------------ |
| dry  | Boolean | false    | Whether to commit data changes |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "adultempire": {
        "path": "./plugins/adultempire.js",
        "args": {
          "dry": false
        }
      }
    },
    "events": {
      "movieCreated": [
        "adultempire"
      ],
      "actorCreated": [
        "adultempire"
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
    adultempire:
      path: ./plugins/adultempire.js
      args:
        dry: false
  events:
    movieCreated:
      - adultempire
    actorCreated:
      - adultempire

---

```
