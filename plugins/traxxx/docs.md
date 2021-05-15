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
