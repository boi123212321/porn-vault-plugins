## legalporno 0.3.0

by boi123212321

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/legalporno.js)

Scrape Legalporno/Analvids scene data

### Arguments

| Name       | Type    | Required | Description                                 |
| ---------- | ------- | -------- | ------------------------------------------- |
| deep       | Boolean | false    | Fetch scene details                         |
| dry        | Boolean | false    | Whether to commit data changes              |
| useSceneId | Boolean | false    | Whether to set scene name to found shoot ID |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "legalporno": {
        "path": "./plugins/legalporno.js",
        "args": {
          "deep": true,
          "dry": false,
          "useSceneId": false
        }
      }
    },
    "events": {
      "sceneCreated": [
        "legalporno"
      ],
      "sceneCustom": [
        "legalporno"
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
    legalporno:
      path: ./plugins/legalporno.js
      args:
        deep: true
        dry: false
        useSceneId: false
  events:
    sceneCreated:
      - legalporno
    sceneCustom:
      - legalporno

---

```
