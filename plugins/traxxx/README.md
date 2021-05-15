## traxxx 0.2.0

by leadwolf

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/traxxx.js)

Scrape data from traxxx

### Documentation

## Plugin Details

This plugin retrieves data from Traxxx.

### Studios

* The plugin returns the following properties:
    * `name` : name of the studio
    * `description` : description of the studio
    * `thumbnail` : thumbnail of the studio
    * `aliases` : aliases of the studio
    * `parent`: the parent channel/network
    * `custom` : custom fields:
        * `Traxxx Slug` : the slug identifier (for use by plugins)
        * `Traxxx Type` : the type of channel/network (for use by plugins)
        * `Homepage` : the Homepage of the studio

> Note: studio custom fields are not yet accessible in the interface.


- In Traxxx, studios can either be channels or networks. Think of a tree: studios with children are networks, and studios with no children are channels.

- When the plugin is run for a name, that can be either a channel or a network, the plugin will return the data according to the `args.studios.channelPriority` config. When `true`, the channel data will be returned, and the network, when `false`.  
In this case, when `args.studios.uniqueNames` is `true`, the name will be appended with the appropriate suffix `args.studios.channelSuffix` & `args.studios.channelSuffix`. Otherwise, the name will be returned as is in Traxxx.
- 🚨 WARNING: If you have a suffix in `channelSuffix`: it may lead to "duplicate" studios being created.  
Example: with a suffix such as `" (Channel)"`. First, a scene as scanned and a scene plugin returns a studio called `"Test"`. Since the studio doesn't exist, it is created. Then this plugin is then run, changing the studio name to `"Test (Channel)"`  
A second sene is scanned, and a scene plugin again returns a studio called `"Test"`. Depending on your matching config, the returned studio `"Test"` may not match the existing studio `"Test (Channel)"`. Thus, a new `"Test"` studio will be created. Then, this plugin is run on the newly created studio, changing its name to `"Test (Channel)"`.  
So now you have 2 studios called `"Test (Channel)"`.

- If the plugin receives a studio name that already has the same suffix as in the args, it will only try to search and return the data for that type indicated by the suffix.

- The plugin supports being piped data. This means, if you have a studio plugin `A` that runs before this plugin `B`, you can make this plugin NOT overwrite properties that plugin `A` already returned values for.  
**WARNING**: this is not the same as values that already exist for the studio. Example: you manually entered a description in the web UI and then run the plugin. If the plugin finds a channel/network with a description, that will become the new one.  
Example: plugin `A` returns `custom.myField: 'a string'`. and plugin `B` *would* also return `custom.myField: 'another string'`. If `studios.whitelistOverride` is non empty, plugin `B` will return that field only if `myField` is in `studios.whitelistOverride`. Otherwise, if `studios.blacklistOverride` is non empty, plugin `B` will return that field only if `myField` is **not** in `studios.blacklistOverride`. Finally, if neither of these two lists are used, the field will be returned.


### Arguments

| Name                      | Type     | Required | Description                                                                                                                                                                                                                                                                                   |
| ------------------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dry                       | Boolean  | false    | Whether to commit data changes                                                                                                                                                                                                                                                                |
| studios                   | Object   | false    | Configuration for studio events                                                                                                                                                                                                                                                               |
| studios.channelPriority   | Boolean  | false    | When the studio type is unknown, and the name corresponds to both a channel & a network, whether to prefer the channel or the network                                                                                                                                                         |
| studios.uniqueNames       | Boolean  | false    | When the studio name corresponds to both a channel & a network, whether to append suffixes to the name to avoid conflicts. The suffixes obviously cannot be the same. If the studio name already has a suffix, it will be kept, even if this setting is false                                 |
| studios.channelSuffix     | String   | false    | When `studios.uniqueNames` is active and returning a **channel** name that also corresponds to a network, will be appended to the name. WARNING: spaces between the name & suffix will not be automatically added                                                                             |
| studios.networkSuffix     | String   | false    | When `studios.uniqueNames` is active and returning a **network** name that also corresponds to a channel, will be appended to the name. WARNING: spaces between the name & suffix will not be automatically added                                                                             |
| studios.mergeAliases      | Boolean  | false    | When the previous plugin returned aliases, if our plugins aliases should be merged with them or override them                                                                                                                                                                                 |
| studios.whitelist         | String[] | false    | Array of data fields to pick. When non empty, only the fields listed will be returned. Possible values: [`'name', 'description', 'thumbnail', 'aliases', 'parent'`].                                                                                                                          |
| studios.blacklist         | String[] | false    | Array of data fields to omit. Used **only** when `whitelist` is empty. When non empty, only the fields **not** listed will be returned. (for values see `whitelist`)                                                                                                                          |
| studios.whitelistOverride | String[] | false    | Array of data fields to pick, when values already exist from a piped plugin. Acts exactly the same as `whitelist`, but used **only** when the field has been returned by a previous plugin. (**WARNING**: not the same thing as existing values of the scene) (for values see `whitelist`)    |
| studios.blacklistOverride | String[] | false    | Array of data fields to omit, when values already exist from a a piped plugin. Acts exactly the same as `blacklist`, but used **only** when the field has been returned by a previous plugin.  (**WARNING**: not the same thing as existing values of the scene) (for values see `whitelist`) |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "traxxx": {
        "path": "./plugins/traxxx.js",
        "args": {
          "dry": false,
          "studios": {
            "channelPriority": true,
            "uniqueNames": true,
            "channelSuffix": "",
            "networkSuffix": " (Network)",
            "mergeAliases": true,
            "whitelist": [],
            "blacklist": [],
            "whitelistOverride": [],
            "blacklistOverride": []
          }
        }
      }
    },
    "events": {
      "studioCreated": [
        "traxxx"
      ],
      "studioCustom": [
        "traxxx"
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
    traxxx:
      path: ./plugins/traxxx.js
      args:
        dry: false
        studios:
          channelPriority: true
          uniqueNames: true
          channelSuffix: ""
          networkSuffix: " (Network)"
          mergeAliases: true
          whitelist: []
          blacklist: []
          whitelistOverride: []
          blacklistOverride: []
  events:
    studioCreated:
      - traxxx
    studioCustom:
      - traxxx

---

```
