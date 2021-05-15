## pics 2.2.0

by boi123212321, john4valor, leadwolf

[Download here](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/pics.js)

Find actor, scene, movie, studio images based on local files. GIF support.

### Documentation

## Plugin Details

This plugin retrieves pictures for actors, scenes, movies or studios

- You can configure an array of search configurations for every type.
- Each search configuration allows for searching for a single *type* of image.
- For every search configuration, the name of the current item the plugin is being run for will automatically be searched for. You may add extra terms to search for via `searchTerms` and prevent matches with `blacklistTerms`
- - 🚨 `WARNING`: make sure to add a search term for a configuration that searches in a folder that contains different types of images (hero, avatar...). Otherwise it may add an avatar image as a hero image or vice versa
- - The name, searchTerms and blackListTerms are all checked for, via `$matcher`:  the matcher configured by `matching.matcher.type` in your config file (config.json/config.yaml)
- - For a file to be considered a match, the name and all search terms must be found, with none of the blacklisted terms being found.
- - Files are searched for recursively from the given `path`
- -  🚨 `WARNING`: if you have a folder for a category/studio... that contains an image with it's own name and other sub categories/studios..., a "wrong" image may be found. Example: if you have a folder "evil-angel" that contains "blackmailed.png" and "evil-angel.png". When searching for "Evil Angel", the plugin might return "blackmailed.png".  
Make sure to use the `mustMatchInFilename` option for the search configuration. This ensures that only "evil-angel.png" will be returned.
- You may have multiple configurations of the same `'prop'`.
- - Only the **last** image found for a given `'prop'` will be created.
- - If you have multiple `'extra'` configurations, all images found across those configurations will be created.

Example with multiple configurations:

```javascript
---
{
  "plugins": {
    "register": {
      "pics": {
        "path": "./plugins/pics/main.ts",
        "args": {
          "dry": false,
          "actors": [
            {
              "prop": "thumbnail",
              "path": "./path/to/low/resolution/actor/pictures",
              "searchTerms": ["thumbnail"]
            },
            {
              "prop": "thumbnail",
              "path": "./path/to/high/resolution/actor/pictures",
              "searchTerms": ["thumbnail"]
            },
            {
              "prop": "altThumbnail",
              "path": "./path/to/alternate_thumbnail/actor/pictures",
              "searchTerms": ["alternate"]
            },
            {
              "prop": "hero",
              "path": "./path/to/all/hero/pictures",
              "searchTerms": ["wide"]
            },
            {
              "prop": "extra",
              "path": "./path/to/all/extra/pictures",
              "blacklistTerms": ["thumbnail", "hero", "avatar"],
              "max": -1
            }
          ]
        }
      }
    }
  }
}
---
```


### Arguments

| Name                            | Type                                                             | Required | Description                                                                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dry                             | Boolean                                                          | false    | Whether to commit data changes                                                                                                                                         |
| actors                          | Array                                                            | true     | Array of picture search configurations for actors                                                                                                                      |
| actors.[0]                      | Object                                                           | true     | One configuration for a type of actor picture                                                                                                                          |
| actors.[0].prop                 | `'thumbnail' \| 'altThumbnail' \| 'avatar' \| 'hero' \| 'extra'` | true     | The type of picture that should be attached to the actor. Set to `'extra'` to add any image you want to the gallery                                                    |
| actors.[0].path                 | string                                                           | true     | The path in which to search for this picture                                                                                                                           |
| actors.[0].searchTerms          | string[]                                                         | false    | Extra terms that the picture path should contain                                                                                                                       |
| actors.[0].blacklistTerms       | string                                                           | false    | Terms that should not be found in an image path                                                                                                                        |
| actors.[0].mustMatchInFilename  | boolean                                                          | false    | If the name of the actor and the `searchTerms` must be matched against the filename, instead of the file path                                                          |
| actors.[0].max                  | number                                                           | false    | Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property |
| scenes                          | Array                                                            | true     | Array of picture search configurations for scenes                                                                                                                      |
| scenes.[0]                      | Object                                                           | true     | One configuration for a type of scene picture                                                                                                                          |
| scenes.[0].prop                 | `'thumbnail' \| 'extra'`                                         | true     | The type of picture that should be attached to the scene. Set to `'extra'` to add any image you want to the gallery                                                    |
| scenes.[0].path                 | string                                                           | true     | The path in which to search for this picture                                                                                                                           |
| scenes.[0].searchTerms          | string[]                                                         | false    | Extra terms that the picture path should contain                                                                                                                       |
| scenes.[0].blacklistTerms       | string                                                           | false    | Terms that should not be found in an image path                                                                                                                        |
| scenes.[0].mustMatchInFilename  | boolean                                                          | false    | If the name of the scene and the `searchTerms` must be matched against the filename, instead of the file path                                                          |
| scenes.[0].max                  | number                                                           | false    | Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property |
| movies                          | Array                                                            | true     | Array of picture search configurations for movies                                                                                                                      |
| movies.[0]                      | Object                                                           | true     | One configuration for a type of movie picture                                                                                                                          |
| movies.[0].prop                 | `'backCover' \| 'frontCover' \| 'spineCover' \| 'extra'`         | true     | The type of picture that should be attached to the movie. Set to `'extra'` to add any image you want to the gallery                                                    |
| movies.[0].path                 | string                                                           | true     | The path in which to search for this picture                                                                                                                           |
| movies.[0].searchTerms          | string[]                                                         | false    | Extra terms that the picture path should contain                                                                                                                       |
| movies.[0].blacklistTerms       | string                                                           | false    | Terms that should not be found in an image path                                                                                                                        |
| actors.[0].mustMatchInFilename  | boolean                                                          | false    | If the name of the movie and the `searchTerms` must be matched against the filename, instead of the file path                                                          |
| movies.[0].max                  | number                                                           | false    | Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property |
| studios                         | Array                                                            | true     | Array of picture search configurations for studios                                                                                                                     |
| studios.[0]                     | Object                                                           | true     | One configuration for a type of studio picture                                                                                                                         |
| studios.[0].prop                | `'thumbnail' \| 'extra'`                                         | true     | The type of picture that should be attached to the studio. Set to `'extra'` to add any image you want to the gallery                                                   |
| studios.[0].path                | string                                                           | true     | The path in which to search for this picture                                                                                                                           |
| studios.[0].searchTerms         | string[]                                                         | false    | Extra terms that the picture path should contain                                                                                                                       |
| studios.[0].blacklistTerms      | string                                                           | false    | Terms that should not be found in an image path                                                                                                                        |
| studios.[0].mustMatchInFilename | boolean                                                          | false    | If the name of the studio and the `searchTerms` must be matched against the filename, instead of the file path                                                         |
| studios.[0].max                 | number                                                           | false    | Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "pics": {
        "path": "./plugins/pics.js",
        "args": {
          "dry": false,
          "actors": [
            {
              "prop": "thumbnail",
              "path": "./path/to/all/actor/pictures",
              "searchTerms": [
                "thumbnail"
              ],
              "blacklistTerms": [],
              "mustMatchInFilename": false,
              "max": -1
            }
          ],
          "scenes": [
            {
              "prop": "thumbnail",
              "path": "./path/to/all/scene/pictures",
              "searchTerms": [
                "thumbnail"
              ],
              "blacklistTerms": [],
              "mustMatchInFilename": false,
              "max": -1
            }
          ],
          "movies": [
            {
              "prop": "thumbnail",
              "path": "./path/to/all/movie/pictures",
              "searchTerms": [
                "thumbnail"
              ],
              "blacklistTerms": [],
              "max": -1
            }
          ],
          "studios": [
            {
              "prop": "thumbnail",
              "path": "./path/to/all/studio/pictures",
              "searchTerms": [
                "thumbnail"
              ],
              "blacklistTerms": [],
              "mustMatchInFilename": false,
              "max": -1
            }
          ]
        }
      }
    },
    "events": {
      "actorCreated": [
        "pics"
      ],
      "actorCustom": [
        "pics"
      ],
      "sceneCreated": [
        "pics"
      ],
      "sceneCustom": [
        "pics"
      ],
      "movieCreated": [
        "pics"
      ],
      "studioCreated": [
        "pics"
      ],
      "studioCustom": [
        "pics"
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
    pics:
      path: ./plugins/pics.js
      args:
        dry: false
        actors:
          - prop: thumbnail
            path: ./path/to/all/actor/pictures
            searchTerms:
              - thumbnail
            blacklistTerms: []
            mustMatchInFilename: false
            max: -1
        scenes:
          - prop: thumbnail
            path: ./path/to/all/scene/pictures
            searchTerms:
              - thumbnail
            blacklistTerms: []
            mustMatchInFilename: false
            max: -1
        movies:
          - prop: thumbnail
            path: ./path/to/all/movie/pictures
            searchTerms:
              - thumbnail
            blacklistTerms: []
            max: -1
        studios:
          - prop: thumbnail
            path: ./path/to/all/studio/pictures
            searchTerms:
              - thumbnail
            blacklistTerms: []
            mustMatchInFilename: false
            max: -1
  events:
    actorCreated:
      - pics
    actorCustom:
      - pics
    sceneCreated:
      - pics
    sceneCustom:
      - pics
    movieCreated:
      - pics
    studioCreated:
      - pics
    studioCustom:
      - pics

---

```
