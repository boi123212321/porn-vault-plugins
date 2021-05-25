### Details

The plugin will search TPDB with one of scene's actors, the studio (these two must have the relevant "parse" args enabled), the date in the scene path and the title (if `useTitleInSearch` is enabled).  
With the results from TPDB, it then tries to match their titles to the title of the scene. If a match is found, it will be returned.  
If no match is found, and `manualTouch` is enabled, you will be able to interactively search or enter the scene's details, until you confirm the result or quit the process.

### Tips

- When running without `manualTouch`, but you still want to search TPDB with a specific string, you can enable `useTitleInSearch`, change the scene's name and then run the plugin.

- If TPDB only returns 1 result and the plugin does not match the titles but you are sure they are the same , you can enable `alwaysUseSingleResult` to override the matching process.

- Make sure to use set your TPDB api key in the args.

### Changelog

- **0.4.2 - server 0.27**
- - Fix: labels were not being returned

<details>
  <summary>Show old versions</summary>
  
- **0.4.1 - server 0.27**
- - Added API key support for 0.4.0 series (see 0.3.2).

- **0.4.0 - server 0.27**
- - Added support for porn-vault 0.27

- **0.3.2 - server 0.26**
- - As of 15/04/2021, an API key is required. See `args.apiKey`

</details>
