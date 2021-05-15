## PromisedScene 0.4.1

by Ch00nassid a.k.a: DGs.Ch00, leadwolf

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/PromisedScene.js)

Ask questions and make sure scene parsing is correct

### Documentation

### Details

The plugin will search TPDB with one of scene's actors, the studio (these two must have the relevant "parse" args enabled), the date in the scene path and the title (if `useTitleInSearch` is enabled).  
With the results from TPDB, it then tries to match their titles to the title of the scene. If a match is found, it will be returned.  
If no match is found, and `manualTouch` is enabled, you will be able to interactively search or enter the scene's details, until you confirm the result or quit the process.

🚨 As of 15/04/2021, an API key is required. See `args.apiKey`

### Tips

- When running without `manualTouch`, but you still want to search TPDB with a specific string, you can enable `useTitleInSearch`, change the scene's name and then run the plugin.

- If TPDB only returns 1 result and  the plugin does not match the titles but you are sure they are the same , you can enable `alwaysUseSingleResult` to override the matching process.

### Arguments

| Name                    | Type    | Required | Description                                                                                                                                                                                        |
| ----------------------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey                  | String  | true     | Your TPDB api key                                                                                                                                                                                  |
| useTitleInSearch        | Boolean | false    | When searching TPDB: in auto search, if should use existing scene title. In manual user search, if should prompt user for title and use in search                                                  |
| alwaysUseSingleResult   | Boolean | false    | When searching TPDB, if there is **only** 1 result, even if its title **doesn't** match the searched title, if should return that data                                                             |
| usePipedInputInSearch   | Boolean | false    | This option is only relevant when PromisedScene is chained from another plugin (piped data are set). If true, the piped data take precedence for the search. If false, the piped data are ignored. |
| parseActor              | Boolean | true     | Try to find the Actor name in your database within the scenePath string                                                                                                                            |
| parseStudio             | Boolean | true     | Try to find the Studio name in your database within the scenePath string                                                                                                                           |
| parseDate               | Boolean | true     | Try to find the date within the scenePath string                                                                                                                                                   |
| manualTouch             | Boolean | true     | If true, will allow you to answer questions to manually enter scene data, manually search TPDB, confirm the final result                                                                           |
| sceneDuplicationCheck   | Boolean | true     | Will notify you of a possible duplicate title that is being imported.  Will not currently stop / correct anything                                                                                  |
| source_settings.actors  | String  | true     | finds the DB file for Actors to determine which actors are currently in your collection                                                                                                            |
| source_settings.studios | String  | true     | finds the DB file for Studios to determine which Studios are currently in your collection                                                                                                          |
| source_settings.scenes  | String  | true     | finds the DB file for Scenes to determine which Scenes are currently in your collection                                                                                                            |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "PromisedScene": {
        "path": "./plugins/PromisedScene.js",
        "args": {
          "apiKey": "INSERT_KEY",
          "useTitleInSearch": false,
          "alwaysUseSingleResult": false,
          "usePipedInputInSearch": false,
          "parseActor": true,
          "parseStudio": true,
          "parseDate": true,
          "manualTouch": true,
          "sceneDuplicationCheck": true,
          "source_settings": {
            "actors": "./library/actors.db",
            "studios": "./library/studios.db",
            "scenes": "./library/scenes.db"
          }
        }
      }
    },
    "events": {
      "sceneCreated": [
        "PromisedScene"
      ],
      "sceneCustom": [
        "PromisedScene"
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
    PromisedScene:
      path: ./plugins/PromisedScene.js
      args:
        apiKey: INSERT_KEY
        useTitleInSearch: false
        alwaysUseSingleResult: false
        usePipedInputInSearch: false
        parseActor: true
        parseStudio: true
        parseDate: true
        manualTouch: true
        sceneDuplicationCheck: true
        source_settings:
          actors: ./library/actors.db
          studios: ./library/studios.db
          scenes: ./library/scenes.db
  events:
    sceneCreated:
      - PromisedScene
    sceneCustom:
      - PromisedScene

---

```
