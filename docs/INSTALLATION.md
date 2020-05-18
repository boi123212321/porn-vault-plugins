# Installation (All Platforms)
Installation of either version of AmDeX is mostly identical. Difference is Izzy version has a few more capabilities and custom data that it can pull.

This installation guide assumes that you are starting from a working fresh install of Porn Vault, and that you have *successfully* launched Porn Vault at least once.

By the end of this guide, you will have successfully set up 2 plugins, namely amdex.js/amdex_izzy.js and adultempire_covers.js. 

# Folders
To install, you will need to have 3 folders. Note the locations of these 3 folders.
1. Porn-Vault Folder - 

Already created during Porn Vault installation. This folder contains the subfolders "app", "assets", "backups", etc.
![Porn-Vault Folder](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/pvaultfolder.PNG)

2. Library Folder -

Already created during Porn Vault installation. This folder contains the subfolders "images", "previews", "thumbnails", etc.
![Library Folder](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/libraryfolder.PNG)

3. Plugins Folder - 

This folder can be placed anywhere that is accessible to Porn Vault. This usually means it resides on the same machine as Porn Vault. You can even place it inside the Porn Vault folder above.

# Installation

## Downloading

First, go to the [main GitHub page](https://github.com/johnnyporn88/porn-manager-plugins) and download the ZIP file.
![Download](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/downloadzip.PNG)

When finished, extract all files to a location of your choosing. When done, you should have a folder containing all the files within this Github page.

You don't need anything else besides amdex.js/amdex_izzy.js and adultempire_covers.js. Delete the rest.

## Configuring Plugins

1. Move both amdex.js/amdex_izzy.js and adultempire_covers.js to your Plugins Folder discussed above.
2. Launch Porn Vault as usual.
3. In a web browser, open your Porn Vault URL. This is usually http://localhost:3000
4. (Optional) If you have configured a password, enter your password to Porn Vault.
5. Once logged into Porn Vault, your URL bar should now show http://localhost:3000/?password=yourpasswordhash#/. It's a fairly long URL.
6. Edit that URL, and add plugins at the very end, so that the URL is now http://localhost:3000/?password=yourpasswordhash#/plugins. Press Enter.
7. You have now arrived at the Plugins configuration assistant for Porn Vault.
![Plugin Config Assist](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/pluginconfigassist.png)
8. Select if you had chosen a JSON config file or a YAML config file during Porn Vault's installation. This guide will proceed with YAML as it is simpler and less finicky.
![JSON or YAML](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/jsonoryaml.png)
9. Click "ADD PLUGIN", and rename "Plugin 0" and "Plugin 1" to whatever you want. You do not have to call the plugins amdex_izzy or adultempire_covers, though it is recommended you do so if you're unsure to avoid silly mistakes.
10. Fill in the directory to your Plugins Folder discussed at the beginning of this guide, and add "amdex_izzy.js" and "adultempire_covers.js" respectively. You should have the following.
![Directory](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/directory.png)
11. Under "Events", type "amdex_izzy" then press TAB in the blanks labelled "actorCreated" and "actorCustom". You should have the following:
![Actor Event Definition](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/actorevents.png)
12. Similarly, type "adult_empire_covers" then press TAB in the blank labelled "movieCreated".
13. Note the JSON/YAML syntax that has been automatically generated in the box at the bottom. In this example, the following YAML syntax was generated:
```yaml
PLUGINS:
  amdex_izzy:
    path: /path/to/your/plugins/folder/amdex_izzy.js
  adultempire_covers:
    path: /path/to/your/plugins/folder/adultempire_covers.js
PLUGIN_EVENTS:
  actorCreated:
    - amdex_izzy
  sceneCreated: []
  actorCustom:
    - amdex_izzy
  sceneCustom: []
  movieCreated:
    - adultempire_covers
```
## Configuring Your Config File
1. Go to your Porn Vault folder.
2. Open your config.yaml/config.json file using a text editor of your choice (Notepad, Notepad++, xed, nano, etc.)

NOTE: I recommend using Notepad++ if you are using Windows. It's far superior to Notepad.

3. Copy and paste the YAML or JSON syntax we generated in the previous section into the config file. You should now have something like the following:
![Pasted](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/pasted.png)
3a. At this point, adultempire_covers has been successfully setup. You can just repeat these steps for other plugins. From here on out, all steps are relevant to AmDeX configuration ONLY.
4.AmDeX requires additional arguments to be added to your config file. Right below the line indicating the path to AmDeX Izzy, paste the following.

If using JSON:
```json
		"args": {
			"debug": false,
			"set_dateofbirth": true,
			"set_avatar": true,
			"set_thumbnail": true,
			"set_alt_thumbnail": true,
			"use_thumbnail_as_avatar_if_not_available": false,
			"set_alias": true,
			"set_bio": true,
			"dateofbirth_source": "freeones",
			"set_nationality": true,
			"nationality_source": "freeones",
			"bio_source": "tpdb",
			"avatar_source": "freeones",
			"thumbnail_source": "babepedia",
			"alt_thumbnail_source": "babepedia",
			"use_next_source_on_failure": false,
			"prefer_metric": false,
			"source_settings": {
				"freeones": {
					"enabled": true,
					"get_aliases": true,
					"custom_field_map": {
						"birthplace": "",
						"eye_color" : "",
						"ethnicity" : "",
						"hair_colour" : ""
					}
				},
				"babepedia": {
					"enabled": true,
					"get_aliases": true,
					"custom_field_map": {}
				},
				"tpdb": {
					"enabled": true,
					"extract_only_if_source_matches_name_exactly": true,
					"get_performer_bio": true,
					"get_all_bios": false,
					"get_aliases": true,
					"get_all_images": false,
					"custom_field_map": {
						"gender": "",
						"birthplace": "",
						"active": "",
						"astrology": "",
						"ethnicity": "",
						"hair_colour": "",
						"weight": "",
						"height": "",
						"measurements": "",
						"cupsize": "",
						"tattoos": "",
						"piercings": "",
						"waist": "",
						"hips": "",
						"chest_size": ""
					}
				}
			}
		}
	}
},
```
If using YAML (DO NOT DELETE INDENTS. Indents are very important for YAMLs):
```
---
	args:
	  debug: false
	  set_dateofbirth: true
	  set_avatar: true
	  set_thumbnail: true
	  set_alt_thumbnail: true
	  use_thumbnail_as_avatar_if_not_available: false
	  set_alias: true
	  set_bio: true
	  dateofbirth_source: freeones
	  set_nationality: true
	  nationality_source: freeones
	  bio_source: tpdb
	  avatar_source: freeones
	  thumbnail_source: babepedia
	  alt_thumbnail_source: babepedia
	  use_next_source_on_failure: false
	  prefer_metric: false
	  source_settings:
		freeones:
		  enabled: true
		  get_aliases: true
		  custom_field_map:
			birthplace: ''
			eye_color: ''
			ethnicity: ''
			hair_colour: ''
		babepedia:
		  enabled: true
		  get_aliases: true
		  custom_field_map: {}
		tpdb:
		  enabled: true
		  extract_only_if_source_matches_name_exactly: true
		  get_performer_bio: true
		  get_all_bios: false
		  get_aliases: true
		  get_all_images: false
		  custom_field_map:
			gender: ''
			birthplace: ''
			active: ''
			astrology: ''
			ethnicity: ''
			hair_colour: ''
			weight: ''
			height: ''
			measurements: ''
			cupsize: ''
			tattoos: ''
			piercings: ''
			waist: ''
			hips: ''
			chest_size: ''
```
5. Shut down and restart Porn-Vault.
6. Make sure that no errors occur during Porn-Vault startup.
7. If no errors occur, go into Porn-Vault again, and test AmDeX by adding a new performer. It should now automatically pull the thumbnail, alt-thumbnail, and avatar images, together with nationality, birthdate and alias data.
8. That's it! You're done setting up the basic functions of AmDeX.

## Pulling Custom Metadata
Besides the data discussed above, AmDeX is also capable of pulling additional info to populate Custom Fields in Porn Vault. I currently have it setup to populate the following data automatically upon actress creation:

![Example](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/exampleamdex.png)

You can pick and choose what information you want. To do so, you first need to create the Custom Fields inside Porn Vault (click the 'Gear' icon on the top right).

So let's say we want to automatically pull breast cupsize data, we will do the following:

1. Create "Cupsize" custom data. You should set this to a STRING type field if you don't really care for the ability to filter by Cupsize later (feature under development).

1a. If you wish, you can use Single Select type field. However, you'll need to pre-populate the field with all possible choices first, or AmDeX will not be able to fill in this Custom Field. Example:

![Cupsize](https://raw.githubusercontent.com/johnnyporn88/porn-manager-plugins/master/docs/imgs/cupsize.png)

2. In the config file we had setup earlier, look for the appropriate line, and type in the name of the Custom Field you have created. For our example, we want breast cupsize data, so we fill in as follows:

```
		  custom_field_map:
			gender: ''
			birthplace: ''
			active: ''
			astrology: ''
			ethnicity: ''
			hair_colour: ''
			weight: ''
			height: ''
			measurements: ''
			cupsize: 'Cupsize'
			tattoos: ''
			piercings: ''
			waist: ''
			hips: ''
			chest_size: ''
```
3. Restart Porn Vault.
4. That's it! AmDeX should now automatically populate the Cupsize custom field. You can repeat these steps, adapting them to whatever custom field you want, as long as the data you're looking for is already pre-defined in the arguments (e.g., you can't pull shoe size, because there is no shoe size argument available in the config).
