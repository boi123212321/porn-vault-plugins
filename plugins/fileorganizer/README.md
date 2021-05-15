## fileorganizer 0.2.0

by arcadianCdr

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/fileorganizer.js)

Use your custom-defined templates to rename your scene files.

### Documentation

Templates is what you use to tell fileorganizer how you want your new file names to look like.

Templates only change file names. The directories and the extensions are never modified.

A template is a succession of __blocks__.

Block syntax: `{prefix<fieldname(args)>suffix}`:

- a `prefix`: your custom fixed text
- a `fieldname`: indicates which porn-vault's data to use in the block
- optional `args`: to modify the field's behavior. See below for args details.  
- a `suffix`: your custom fixed text

Example of a block:

```html
{ <videoHeight>p}
```

This group has

- a `space` as prefix
- a field that references the scene's video height
- no args
- the letter "p" as suffix

For a scene with a video height of 2160 pixels, this block would output `" 2160p"` to the renamed file.

Example of a complete rename template (succession of blocks):

```
{<studio!>}{ - <releaseDate>}{ - <actors>}{ - <name!>}{ - <movies1>}{ (<videoHeight>p)}
```

### Supported fields

| Field name          | Comment                |
| ------------------- | ------------------- |
| `actors`            | multi-value |
| `labels`            | multi-value |
| `movies`            | multi-value |
| `name`              | a.k.a. scene's title |
| `rating`            | number between 0 and 10 |
| `releaseDate`       | see `dateFormat` below to customize the output format |
| `studio`            | |
| `videoDuration`     | HH:MM or HH:MM:SS depending on the duration |
| `videoHeight`       | number of pixels |
| `videoWidth`        | number of pixels |

### Blocks: key characteristics

- Blocks are "all or nothing". If the field has a value (it is not empty), the prefix/suffix fixed text and the field value are output in the new filename. If the field value is empty, the whole block is ignored, including the fixed text.
- Each block can contain only one field. If you need more fields, use more blocks.
- The template only processes what is __inside__ the blocks. Don't put anything between the blocks, it will be ignored (if you want, you can put spaces to improve readability. It will not break anything, but will have no effect on the file name output). 

### Fields: key characteristics

- Field names are __not__ case sensitive.
- Fields can contain optional `args`: an `index` or `!` (or both). 
- For multi-value fields, the default behavior is to output all values into the new filename (eg: `<movies>` outputs "all movies"; see `multiValuesSeparator` below to customize the separator used between each value). It is possible to use only one of the values, by specifying its index as argument, directly after the field name (ex: `<movies1>` outputs only the first movie). An index can range from 1 to 99.
- You can indicate you consider a field to be mandatory by adding a `'!'` argument directly after the field name: `<movies!>`. When a mandatory field returns no data, the whole rename template is ignored. In other words a mandatory field means "I'd rather not rename this file at all if the field is not present in porn-vault's data".
- Arguments can be combined. `<movies>`, `<movies!>`, `<movies1>` and `<movies1!>` are all valid fields.

### File name constraints

In filenames, there are some illegal and reserved characters like `"`, `/`, `*`, `<`, `?`, `>`, `:` and `|`.  By default, characters that are invalid in a filename are removed.

Alternatively, you can use the `characterReplacement` argument to indicate a list of replacement characters you would like to substitute in the new filename. 

This is not limited to illegal characters, Any string can be replaced by another one through `characterReplacement` config.

For instance, if you want to replace all spaces by underscores, you can use (in JSON format):

```json
"characterReplacement": [
  {
    "original": " ",
    "replacement": "_"
  }
]
```

There is also a limitation to the filename's length (255 characters). You will get a warning that the file rename was not performed when the new name exceeds 255 characters.



### Arguments

| Name                    | Type     | Required | Description                                                                                                                                                                                                                                                                                                 |
| ----------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dry                     | Boolean  | false    | Whether to perform the rename operation or just a simulation.                                                                                                                                                                                                                                               |
| fileStructureTemplate   | String   | true     | The template for the new name. See documentation above for details.                                                                                                                                                                                                                                         |
| normalizeAccents        | Boolean  | false    | Whether to normalize file names and path to unaccented unicode.                                                                                                                                                                                                                                             |
| normalizeMultipleSpaces | Boolean  | false    | Whether to replace multiple spaces with a single space.                                                                                                                                                                                                                                                     |
| nameConflictHandling    | String   | false    | Behavior in case of name conflicts. Possible values are: `rename` and `skip`. With `rename`, the new filename is suffixed with a number so that it does not conflict with an existing name anymore. With `skip`, the rename operation is cancelled.                                                         |
| dateFormat              | String   | false    | The date format to use in file names. The full details are available at https://momentjs.com/docs/#/displaying/format/ although you probably just need `YYYY`, `MM` and `DD`.                                                                                                                               |
| multiValuesSeparator    | String   | true     | The separator to use for multiple values (like actors, labels,...). For instance, with a `', '` as separator, a list of 3 labels will look like: `label1, label2, label3`.                                                                                                                                  |
| characterReplacement    | object[] | false    | Used to substitute characters with a replacement alternative. See doc above for details. Note: the examples below looks like it is replacing a colon by a colon, but it is actually replacing the colon (illegal in filenames) by the similar looking 'mathematical ratio' character (allowed in filenames) |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "fileorganizer": {
        "path": "./plugins/fileorganizer.js",
        "args": {
          "dry": false,
          "fileStructureTemplate": "",
          "normalizeAccents": false,
          "normalizeMultipleSpaces": true,
          "nameConflictHandling": "rename",
          "dateFormat": "YYYY-MM-DD",
          "multiValuesSeparator": ", ",
          "characterReplacement": [
            {
              "original": ":",
              "replacement": "∶"
            }
          ]
        }
      }
    },
    "events": {
      "sceneCreated": [
        "fileorganizer"
      ],
      "sceneCustom": [
        "fileorganizer"
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
    fileorganizer:
      path: ./plugins/fileorganizer.js
      args:
        dry: false
        fileStructureTemplate: ""
        normalizeAccents: false
        normalizeMultipleSpaces: true
        nameConflictHandling: rename
        dateFormat: YYYY-MM-DD
        multiValuesSeparator: ", "
        characterReplacement:
          - original: ":"
            replacement: ∶
  events:
    sceneCreated:
      - fileorganizer
    sceneCustom:
      - fileorganizer

---

```
