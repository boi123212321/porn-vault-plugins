## resolution 0.1.0

by boi123212321

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/resolution.js)

Add resolution labels to a scene

### Arguments

| Name        | Type     | Required | Description                                                                                         |
| ----------- | -------- | -------- | --------------------------------------------------------------------------------------------------- |
| resolutions | number[] | false    | Resolutions to match against the scene's path, when the scene's metadata has not yet been extracted |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "resolution": {
        "path": "./plugins/resolution.js",
        "args": {
          "resolutions": []
        }
      }
    },
    "events": {
      "sceneCreated": [
        "resolution"
      ],
      "sceneCustom": [
        "resolution"
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
    resolution:
      path: ./plugins/resolution.js
      args:
        resolutions: []
  events:
    sceneCreated:
      - resolution
    sceneCustom:
      - resolution

---

```
