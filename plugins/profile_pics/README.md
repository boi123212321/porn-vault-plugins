## profile_pics 1.1.0

by boi123212321

## Change Log
1.1.0 - Extended to include alt, avatar, and hero images. Added GIF support. Removed need for args for target.

Find actor images based on local files
### Arguments

| Name   | Type   | Required | Description                                                                         |
| ------ | ------ | -------- | ----------------------------------------------------------------------------------- |
| path_thumb   | String | true     | Folder to search thumbnail images in                                          |
| path_alt   | String | true     | Folder to search alt thumbnail images in                                        |
| path_avatar   | String | true     | Folder to search avatar images in                                          |
| path_hero   | String | true     | Folder to search hero images in                                          |

### Example installation

```json
{
  "PLUGINS": {
    "profile_pics": {
      "path": "./plugins/profile_pics/main.js",
      "args": {
        "path_thumb": "",
        "path_alt": "",
        "path_avatar": "",
        "path_hero": "",
      }
    }
  }
}
```

```yaml
---
PLUGINS:
  "profile_pics":
    path: "./plugins/profile_pics/main.js"
    args:
      path_thumb: ""
      path_alt: ""
      path_avatar: ""
      path_hero: ""
```
