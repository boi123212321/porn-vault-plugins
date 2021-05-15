## Usage

- `npm i`
- `npm start`

### Description

Each plugin `README.md` will be generated from the `info.json` and `docs.md` files their directory.  
See the [plugin_template.md](https://github.com/boi123212321/porn-vault-plugins/blob/master/md_gen/plugin_template.md) to get an idea of what it will look like.

### `info.json`

The `info.json` file should follow this schema:

```typescript
interface PluginArg {
  name: string;
  type: boolean;
  required: boolean;
  default?: any;
  description?: string;
}

type PluginEvents =
  | "actorCreated"
  | "actorCustom"
  | "sceneCreated"
  | "sceneCustom"
  | "movieCreated";

interface PluginInfo {
  name: string;
  version: string;
  authors: string[];
  description: string;
  events: PluginEvents[];
  arguments: PluginArg[];
}
```

### `docs.md`

Whatever is in this file will be inserted into the `README.md`
