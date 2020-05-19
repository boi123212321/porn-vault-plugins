/*
    [AmDeX] : Actor MetaData Extractor v1.2 (2020-APR-13)

    This "extensible" Actor plugin currently extracts actor information from:
        - FreeOnes
            - Date of Birth
            - City of Birth
            - State of Birth
            - Nation of Birth
            - Actor Image
        - BabePedia
            - Actor Aliases
            - Actor Images (up to two)
        - ThePornDB
            - Actor Bio
            - Actor Aliases
            - Gender
            - BirthPlace
            - Active
            - Astrology
            - Ethnicity
            - Nationality
            - Hair Color
            - Weight (Metric/Imperial)
            - Height (Metric/Imperial)
            - Measurements
            - Cup Size
            - Tattoos
            - Piercings
            - Waist
            - Hips
            - Chest Size

    This plugin is customizable which allows you to:
        - Toggle individual pieces of data extracted if you don't want to store everything
        - Select a source for an image (avatar, thumbnail, alt thumbnail) or date of birth
        - Choose between metric or imperial units for height and weight

    Unfortunately, this requires a massive configuration included as plugin arguments.
    Please use the initial plugin configuration provided below in your config file.

    Set individual settings as true/false as desired.
    To extract a certain custom field (located within custom_field_map for each source),
        create a custom field within the Porn Manager and add its EXACT NAME next to the
        field you would like to extract.
        Leave the field as an empty string if you do not want to extract a certain custom field.

    Set debug to true if you want to see extracted data in the console without saving anything.

    EXTENDING THIS PLUGIN TO SUPPORT A NEW SOURCE:
        1. Add your source information in the config file under "source_settings"
        2. Look through this plugin for comments containing [EXTEND] and add your code there
        3. Respect user settings
        4. ???
        5. Profit

    CURRENTLY-NOT-IMPLEMENTED:
        - use_next_source_on_failure

    Thanks @john4valor for help with TPDB and FreeOnes

    Enjoy!
        -github.com/slybot

    If your config file is in JSON:
    "PLUGINS": {
        "AmDeX": {
            "path": "./plugins/amdex.js",
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
                            "nation_of_birth": "",
                            "birthplace": ""
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
                            "nationality": "",
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
    "PLUGIN_EVENTS": {
        "actorCreated": [
            "AmDeX"
        ],
        "actorCustom": [
            "AmDeX"
        ]
    }
    

    If your config file is in YAML:
    ---
    PLUGINS:
      AmDeX:
        path: "./plugins/amdex.js"
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
                nation_of_birth: ''
                birthplace: ''
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
                nationality: ''
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
      PLUGIN_EVENTS:
        actorCreated:
            - AmDeX
        actorCustom:
            - AmDeX
*/
async ({
    event,
    args,
    $axios,
    $moment,
    $cheerio,
    $throw,
    $log,
    actorName,
    $createImage
}) => {
    let result = {};
    let tasks = [];

    $log(`[AMDX] MSG: START ${actorName}`);
    if (event != "actorCreated" && event != "actorCustom") {
        $throw(
            "[AMDX] ERR: Plugin used for unsupported event"
        );
    }
    // TODO: Check integrity of provided args in config file
    if (args.source_settings === undefined) {
        $throw("[AMDX] ERR: Missing source_settings in plugin args");
    }
    const src_config = args.source_settings;
    // Add each source to tasks if enabled in config
    // [EXTEND]: Add your new API getter to the tasks Array.
    if (src_config.freeones !== undefined && src_config.freeones.enabled) {
        tasks.push(get_info_from_freeones(actorName, src_config.freeones));
    }
    if (src_config.babepedia !== undefined && src_config.babepedia.enabled) {
        tasks.push(get_info_from_babepedia(actorName, src_config.babepedia));
    }
    if (src_config.tpdb !== undefined && src_config.tpdb.enabled) {
        tasks.push(get_info_from_tpdb(actorName, src_config.tpdb));
    }
    // Fetch data from all sources concurrently
    const sourced_info = await Promise.all(tasks).catch(e => $log(`"[AMDX] ERR: ${e}`));
    // Create result object by processing each source response individually
    sourced_info.forEach(element => {
        $log(`[AMDX] Processing data from ${element.id}`);
        // Set avatar
        if (args.set_avatar && args.avatar_source === element.id) {
            result['avatar'] = element.img_urls.shift();
        }
        // TODO: implement use next source on failure here
        // Set thumbnail and alt thumbnail
        if (args.set_thumbnail && args.thumbnail_source === element.id && args.set_alt_thumbnail && args.alt_thumbnail_source) {
            if (element.img_urls.length >= 2) {
                // BabePedia hack where first image is better as an alt thumbnail
                result['altThumbnail'] = element.img_urls.shift();
                result['thumbnail'] = element.img_urls.shift();
            }
            else if (element.img_urls.length == 1) {
                result['thumbnail'] = element.img_urls.shift();
            }
        }
        else if (args.set_thumbnail && args.thumbnail_source === element.id) {
            result['thumbnail'] = element.img_urls.shift();
        }
        else if (args.set_alt_thumbnail && args.alt_thumbnail_source === element.id) {
            result['altThumbnail'] = element.img_urls.shift();
        }
        // Set Aliases
        if (args.set_alias && src_config[element.id].get_aliases !== undefined && src_config[element.id].get_aliases) {
            if (result['aliases'] === undefined) {
                result['aliases'] = [];
            }
            if (element['alias_list'] !== undefined) {
                element['alias_list'].forEach(al => {
                    // Ensure duplicate aliases are not included
                    if (!result['aliases'].includes(al)) {
                        result['aliases'].push(al);
                    }
                });
            }
        }
        // Set Bio
        if (args.set_bio && args.bio_source === element.id) {
            if (element.bio !== undefined) {
                if (element.bio instanceof Set) {
                    // Join with newline if multiple bios requested by user.
                    result['description'] = Array.from(element.bio).join('\n');
                } else {
                    // Single bio requested by user.
                    result['description'] = element.bio;
                }
            }
        }
        // Set Birth date
        if (args.set_dateofbirth && args.dateofbirth_source === element.id) {
            // Fix date issue with timestamp causing dates to appear
            // one day behind or ahead of actual birthdate due to
            // user time zone.
            let tz_offset_to_utc = (new Date).getTimezoneOffset() * 60000;
            result['bornOn'] = element.born_on + tz_offset_to_utc;
        }
        // Set Custom Fields
        if (result['custom'] === undefined) {
            result['custom'] = {};
        }
        const src_custom_fields = src_config[element.id].custom_field_map;
        // Set Custom Fields: FreeOnes
        if (element.id == "freeones") {
            if (is_enabled_custom_field(element, "nation_of_birth", src_custom_fields)) {
                result['custom'][src_custom_fields.nation_of_birth] = element.extra_info.nation_of_birth;
            }
            if (is_enabled_custom_field(element, "birthplace", src_custom_fields)) {
                result['custom'][src_custom_fields.birthplace] = element.extra_info.birthplace;
            }
        }
        // Set Custom Fields: TPDB
        else if (element.id == "tpdb") {
            if (is_enabled_custom_field(element, "gender", src_custom_fields)) {
                result['custom'][src_custom_fields.gender] = element.extra_info.gender;
            }
            if (is_enabled_custom_field(element, "birthplace", src_custom_fields)) {
                result['custom'][src_custom_fields.birthplace] = element.extra_info.birthplace;
            }
            // NOTE: active is expected to be a bool or a string in the UI
            if (is_enabled_custom_field(element, "active", src_custom_fields)) {
                result['custom'][src_custom_fields.active] = element.extra_info.active;
            }
            if (is_enabled_custom_field(element, "astrology", src_custom_fields)) {
                const astro = element.extra_info.astrology.split(" ")[0].trim();
                result['custom'][src_custom_fields.astrology] = astro;
            }
            if (is_enabled_custom_field(element, "ethnicity", src_custom_fields)) {
                result['custom'][src_custom_fields.ethnicity] = element.extra_info.ethnicity;
            }
            if (is_enabled_custom_field(element, "nationality", src_custom_fields)) {
                result['custom'][src_custom_fields.nationality] = element.extra_info.nationality;
            }
            if (is_enabled_custom_field(element, "hair_colour", src_custom_fields)) {
                result['custom'][src_custom_fields.hair_colour] = element.extra_info.hair_colour;
            }
            if (is_enabled_custom_field(element, "weight", src_custom_fields)) {
                // metric is default for TPDB, convert if requested by user
                let wgt = element.extra_info.weight.split("k")[0].trim();
                if (!args["prefer_metric"]) {
                    // convert to imperial
                    wgt *= 2.2;
                    wgt = Math.round((wgt + Number.EPSILON) * 100) / 100;
                }
                result['custom'][src_custom_fields.weight] = wgt;
            }
            if (is_enabled_custom_field(element, "height", src_custom_fields)) {
                // default is in metric for TPDB, convert if requested by user
                let hgt = element.extra_info.height.split("c")[0].trim();
                if (!args["prefer_metric"]) {
                    // convert to imperial
                    hgt *= 0.033;
                    hgt = Math.round((hgt + Number.EPSILON) * 100) / 100;
                }
                result['custom'][src_custom_fields.height] = hgt;
            }
            if (is_enabled_custom_field(element, "measurements", src_custom_fields)) {
                result['custom'][src_custom_fields.measurements] = element.extra_info.measurements;
            }
            if (is_enabled_custom_field(element, "cupsize", src_custom_fields)) {
                const cup = element.extra_info.measurements.split("-")[0].substr(2);
                result['custom'][src_custom_fields.cupsize] = cup;
            }
            if (is_enabled_custom_field(element, "tattoos", src_custom_fields)) {
                result['custom'][src_custom_fields.tattoos] = element.extra_info.tattoos;
            }
            if (is_enabled_custom_field(element, "piercings", src_custom_fields)) {
                result['custom'][src_custom_fields.piercings] = element.extra_info.piercings;
            }
            if (is_enabled_custom_field(element, "waist", src_custom_fields)) {
                const wst = element.extra_info.measurements.split("-")[1].substr(0, 2);
                result['custom'][src_custom_fields.waist] = wst;
            }
            if (is_enabled_custom_field(element, "hips", src_custom_fields)) {
                const hps = element.extra_info.measurements.split("-")[2].substr(0, 2);
                result['custom'][src_custom_fields.hips] = hps;
            }
            // Set chest size
            if (is_enabled_custom_field(element, "measurements", src_custom_fields)) {
                const csz = element.extra_info.measurements.split("-")[0].substr(0, 2);
                result['custom'][src_custom_fields.chest_size] = csz;
            }
        }
        // [EXTEND]: Add Custom Field Processing for your Source Here
    });
    // All data has been set in the results object at this point except for images
    // Download images and replace URLs with image ids in result object
    $log("[AMDX] MSG: Downloading Images");
    result = await save_images_from_result(actorName, result);
    if (args.use_thumbnail_as_avatar_if_not_available && !result['avatar']) {
        if(result['thumbnail']) {
            $log("[AMDX] MSG: Avatar NOT available. Using Thumbnail as Avatar");
            result['avatar'] = result['thumbnail'];
        }
        else if(result['altThumbnail']) {
            $log("[AMDX] MSG: Avatar and Thumbnail NOT available. Using Alt Thumbnail as Avatar");
            result['avatar'] = result['altThumbnail'];
        }
    }
    // Do not return/save results if running in debug mode
    if (args.debug) {
        $log("[AMDX] MSG: Final Result:")
        $log(JSON.stringify(result));
        result = {};
    }
    $log(`[AMDX] MSG: END ${actorName}`);
    return result;

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------

    // Returns true if a custom field is enabled in the plugin config
    function is_enabled_custom_field(src_element, custom_field, src_custom_fields) {
        try {
            if (src_element.extra_info !== undefined &&
                src_element.extra_info[custom_field] !== undefined &&
                src_element.extra_info[custom_field] &&
                src_element.extra_info[custom_field] !== "" && src_custom_fields[custom_field] !== "") {
                return true;
            }
        } catch (error) {
            $log("[AMDX] ERR: is_enabled_custom_field() -> ", error);
            return false;
        }
        return false;
    }

    // Downloads image and replaces URL in src_result with Image ID
    async function save_images_from_result(actor_name, src_result) {
        // Use async only if all images are present, or else image order gets screwed up
        if (src_result.avatar && src_result.thumbnail && src_result.altThumbnail) {
            $log("[AMDX] MSG: ALL Image URLs Available. Downloading CONCURRENTLY");
            let img_dl_tasks = [];
            img_dl_tasks.push($createImage(src_result['avatar'], `${actor_name} (profile picture)`));
            img_dl_tasks.push($createImage(src_result['thumbnail'], `${actor_name} (thumb)`));
            img_dl_tasks.push($createImage(src_result['altThumbnail'], `${actor_name} (altthumb)`));
            const dl_imgs = await Promise.all(img_dl_tasks).catch(e => $log(`"[AMDX] ERR: Image download failed -> ${e}`));
            src_result['avatar'] = dl_imgs[0];
            src_result['thumbnail'] = dl_imgs[1];
            src_result['altThumbnail'] = dl_imgs[2];
        }
        else if(src_result.avatar || src_result.thumbnail || src_result.altThumbnail) {
            $log("[AMDX] MSG: SOME Image URLs Available. Downloading SEQUENTIALLY");
            if (src_result.avatar !== undefined && src_result.avatar.startsWith('http')) {
                src_result['avatar'] = await $createImage(src_result['avatar'], `${actor_name} (profile picture)`);
            }
            if (src_result.thumbnail !== undefined && src_result.thumbnail.startsWith('http')) {
                src_result['thumbnail'] = await $createImage(src_result['thumbnail'], `${actor_name} (thumb)`);
            }
            if (src_result.altThumbnail !== undefined && src_result.altThumbnail.startsWith('http')) {
                src_result['altThumbnail'] = await $createImage(src_result['altThumbnail'], `${actor_name} (altthumb)`);
            }
            else {
                $log("[AMDX] ERR: No Image URLs available");
            }
        }
        return src_result;
    }

    // Get Actor data sourced from FreeOnes
    async function get_info_from_freeones(actor_name, settings) {
        $log("[AMDX] MSG: START FreeOnes Data Extraction");
        let result = {
            'id': 'freeones',
            'img_urls': []
        };
        const freeones_url = `https://www.freeones.xxx/${actor_name.replace(".", "").replace(/ /g, "-")}/profile`;
        let freeones_html = "";
        var freeones_response = (await $axios.get(freeones_url, { validateStatus: false }));
        let $ = null;
        // Get Date of Birth first
        if (freeones_response.status == 200) {
            freeones_html = freeones_response.data;
            $ = $cheerio.load(freeones_html);
            const first = $(".profile-meta-item a").toArray()[0];
            const href = $(first).attr("href");
            const yyyymmdd = href.match(/\d\d\d\d-\d\d-\d\d/);
            if (yyyymmdd && yyyymmdd.length) {
                const date = yyyymmdd[0];
                const timestamp = $moment(date, "YYYY-MM-DD").valueOf();
                result["born_on"] = timestamp;
            } else {
                $log("[AMDX] ERR: FreeOnes Date of Birth NOT found");
            }
            // Get image if not placeholder
            const freeones_actor_images = $(".img-fluid").toArray();
            const freeones_actor_image_url = $(freeones_actor_images[0]).attr("src").split("?")[0];
            // FreeOnes uses a placeholder image when no image is present. Do not download if placeholder image is found.
            if (!freeones_actor_image_url.endsWith("no-image-teaser.png")) {
                result["img_urls"].push(freeones_actor_image_url);
            } else {
                $log("[AMDX] ERR: FreeOnes No image found for actor");
            }
        } else {
            $log("[AMDX] ERR: FreeOnes Page NOT found");
            return result;
        }
        // Set up extra info for custom fields
        result['extra_info'] = {};
        // Get city of birth
        const bcity_sel = $('[data-test="section-personal-information"] a[href*="placeOfBirth"]');
        const bcity_name = bcity_sel.length ? $(bcity_sel).attr("href").split("=").slice(-1)[0] : null;
        let bplace = "";
        if (!bcity_name) {
            $log("[AMDX] ERR: FreeOnes No city found for actor");
        } else {
            // Get state of birth
            const bstate_sel = $('[data-test="section-personal-information"] a[href*="province"]');
            const bstate_name = bstate_sel.length ? $(bstate_sel).attr("href").split("=").slice(-1)[0] : null;
            if (!bstate_name) {
                $log("[AMDX] ERR: FreeOnes No state found for actor");
                bplace = bcity_name;
            } else {
                // US states in FreeOnes appear like: GA - Georgia
                // Just keep the state code
                bplace = bcity_name + ', ' + bstate_name.split("-")[0].trim();
            }
        }
        // Set birthplace using available information
        result['extra_info']['birthplace'] = bplace;
        // Get nation of birth
        const bnation_sel = $('[data-test="section-personal-information"] a[href*="country%5D"]');
        const bnation_name = bnation_sel.length ? $(bnation_sel).attr("href").split("=").slice(-1)[0] : null;
        if (!bnation_name) {
            $log("[AMDX] ERR: FreeOnes No nation found for actor");
        } else {
            result['extra_info']['nation_of_birth'] = bnation_name;
        }
        $log("[AMDX] MSG: END FreeOnes Data Extraction");
        return result;
    }

    // Get Actor data sourced from BabePedia
    async function get_info_from_babepedia(actor_name, settings) {
        $log("[AMDX] MSG: START BabePedia Data Extraction");
        let result = {
            'id': 'babepedia',
            'img_urls': []
        };
        // Extract Actor aliases and up to two images from BabePedia
        const bpedia_profile_url = `https://www.babepedia.com/babe/${actor_name.replace(/ /g, "_")}`;
        const bpedia_response = (await $axios.get(bpedia_profile_url, { validateStatus: false }));
        if (bpedia_response.status == 200) {
            const bpedia_page_content = bpedia_response.data;
            const bpedia_cheerio = $cheerio.load(bpedia_page_content);
            const raw_aliases = bpedia_cheerio("#bioarea h2").html()
            // Sometimes there's an extra space in the Aliases section
            if (raw_aliases !== null && (raw_aliases.startsWith("aka  ") || raw_aliases.startsWith("aka "))) {
                // Split aliases by a slash into a list
                const alias_list = raw_aliases.replace("aka  ", "").replace("aka ", "").split(" / ");
                result["alias_list"] = alias_list;
            } else {
                $log("[AMDX] ERR: BabePedia No alias found for actor");
            }
            // This specific URL usually works great as an alternate thumbnail
            const bpedia_thumb_url = bpedia_cheerio("#profimg a").attr("href");
            const bpedia_altthumb_element = bpedia_cheerio(".prof a")[0];
            if (bpedia_altthumb_element) {
                const bpedia_altthumb_url = "https://www.babepedia.com" + bpedia_altthumb_element["attribs"]["href"];
                result["img_urls"].push(bpedia_altthumb_url);
            }
            else {
                $log("[AMDX] ERR: BabePedia First image NOT found for actor");
            }
            // This specific URL usually works great as the primary thumbnail
            if (bpedia_thumb_url !== undefined && !bpedia_thumb_url.startsWith("javascript:alert")) {
                const bpedia_thumbnail_url = "https://www.babepedia.com" + bpedia_thumb_url;
                result["img_urls"].push(bpedia_thumbnail_url);
            } else {
                $log("[AMDX] ERR: BabePedia Second image NOT found for actor");
            }
        }
        $log("[AMDX] MSG: END BabePedia Data Extraction");
        return result;
    }

    // Get Actor Data sourced from ThePornDB
    async function get_info_from_tpdb(actor_name, settings) {
        $log("[AMDX] MSG: START TPDB Data Extraction");
        let result = {
            'id': 'tpdb',
            'img_urls': [],
            'bio': new Set()
        };
        const tpdb_perf_search_url = `https://master.metadataapi.net/api/performers?q=${encodeURI(actor_name)}`;
        const tpdb_perf_search_response = (await $axios.get(tpdb_perf_search_url, { validateStatus: false }));
        if (tpdb_perf_search_response.status != 200 || tpdb_perf_search_response.data === undefined) {
            $log("[AMDX] ERR: TPDB API query failed");
            return result;
        }
        const tpdb_perf_search_content = tpdb_perf_search_response.data;
        // TPDB returns fuzzy matches if actor name does not match
        // Ensure the correct result is selected if user requested an exact match.
        // Else pick the first result that appears in the response.
        let correct_perf_idx = -1;
        if (tpdb_perf_search_content.data.length == 1 && !settings.extract_only_if_source_matches_name_exactly) {
            correct_perf_idx = 0;
        }
        if (tpdb_perf_search_content.data.length >= 1 && settings.extract_only_if_source_matches_name_exactly) {
            for (let idx = 0; idx < tpdb_perf_search_content.data.length; idx++) {
                const element = tpdb_perf_search_content.data[idx];
                if (element.name === actor_name) {
                    correct_perf_idx = idx;
                    break;
                }
            }
        }
        if (correct_perf_idx == -1) {
            $log("[AMDX] ERR: TPDB Could NOT find correct actor info");
            return result;
        }
        const tpdb_perf_search_data = tpdb_perf_search_content.data[correct_perf_idx];
        // Get initial Bio from search result
        if (tpdb_perf_search_data.bio !== "") {
            result['bio'].add(tpdb_perf_search_data.bio);
        }
        // Get Image and Thumbnail from search result
        result['img_urls'].push(tpdb_perf_search_data.image);
        result['img_urls'].push(tpdb_perf_search_data.thumbnail);
        const tpdb_perf_url = `https://master.metadataapi.net/api/performers/${tpdb_perf_search_data.id}`;
        const tpdb_perf_response = (await $axios.get(tpdb_perf_url, { validateStatus: false }));
        if (tpdb_perf_response.status != 200 || tpdb_perf_response.data === undefined) {
            $log("[AMDX] ERR: TPDB Direct Actor Information Access Failed");
            return result;
        }
        const perf_data = tpdb_perf_response.data.data;
        if (perf_data === undefined) {
            $log("[AMDX] ERR: TPDB Could NOT read actor information");
            return result;
        }
        // Add actor bio if user requested all bio
        if (perf_data.bio !== "" && settings.get_all_bios) {
            result['bio'].add(perf_data.bio);
        }
        // Add all extra from TPDB to extra_info for Custom Field processing later
        result['extra_info'] = perf_data.extras;
        result['alias_list'] = perf_data.aliases;
        // Ensure duplicate URLs are not added
        // w/ TPDB it's usually the same image everywhere :/
        if (!result['img_urls'].includes(perf_data.image)) {
            result['img_urls'].push(perf_data.image);
        }
        if (!result['img_urls'].includes(perf_data.thumbnail)) {
            result['img_urls'].push(perf_data.thumbnail);
        }
        // Read poster URLs
        perf_data.posters.forEach(element => {
            if (!result['img_urls'].includes(element['url'])) {
                result['img_urls'].push(element['url']);
            }
        });
        // Get all bios and image URLs if requested by user
        if (settings.get_all_bios || settings.get_all_images) {
            perf_data.site_performers.forEach(element => {
                if (settings.get_all_bios && element.bio !== "") {
                    result['bio'].add(element.bio);
                }
                if (settings.get_all_images && !result['img_urls'].includes(element.image)) {
                    result['img_urls'].push(element.image);
                }
                if (settings.get_all_images && !result['img_urls'].includes(element.thumbnail)) {
                    result['img_urls'].push(element.thumbnail);
                }
            });
        }
        $log("[AMDX] MSG: END TPDB Data Extraction");
        return result;
    }
}