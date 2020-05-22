## freeones 0.4.0

by boi123212321,john4valor

Scrape data from freeones.xxx. Custom fields can only be named as follows (not case sensitive): Hair Color, Eye Color, Ethnicity, Height, Weight, Birthplace, Zodiac
### Arguments

| Name        | Type          | Required | Description                                                                                                                                                   |
| ----------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dry         | Boolean       | false    | Whether to commit data changes                                                                                                                                |
| blacklist   | Array&lt;String&gt; | false    | Array of data fields to omit (possible values: &#x27;zodiac&#x27;, &#x27;aliases&#x27;, &#x27;height&#x27;, &#x27;weight&#x27;, &#x27;avatar&#x27;, &#x27;bornOn&#x27;, &#x27;labels&#x27;, &#x27;hair color&#x27;, &#x27;eye color&#x27;, &#x27;ethnicity&#x27;) |
| useImperial | String        | false    | Use imperial units for height and weight (possible values: &#x27;true&#x27;, &#x27;false&#x27;)                                                                                   |
### Example installation

```json
{
  "PLUGINS": {
    "freeones": {
      "path": "./plugins/freeones/main.js",
      "args": {}
    }
  }
}
```

```yaml
---
PLUGINS:
  "freeones":
    path: "./plugins/freeones/main.js"
    args: {}
```
