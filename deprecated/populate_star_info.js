/*
    ---------------------------------------------------------------------------
        WARNING: THIS PLUGIN IS NOW DEPRECATED AND WILL NOT BE UPDATED!
        PLEASE USE THE AmDeX PLUGIN INSTEAD.

        AmDeX has feature parity with this plugin and offers many more
        features and performance improvements.
    
        PLEASE USE amdex.js AND READ THE SETUP INSTRUCTIONS PRESENT AT THE
        BEGINNING OF THE PLUGIN FILE.
    ---------------------------------------------------------------------------

    This actor plugin extracts the following information:
    1. Actor images for Avatar, Thumbnail and Alternate Thumbnail
       a. Smart image extraction - placeholder images from FreeOnes are not downloaded
    2. Actor Date of Birth
    3. Actor Aliases

    Data Sources: FreeOnes + BabePedia
    Extended from: https://github.com/boi123212321/porn-manager-plugins/blob/master/freeones_age.js

    This plugin has feature parity with freeones_age.js (above) with additional features.

    Enjoy!
       - github.com/slybot
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
    if (event != "actorCreated" && event != "actorCustom")
        $throw(
            "Uh oh. You shouldn't use the plugin for this type of event");

    let result = {};
    // Extract Actor image and date of birth from FreeOnes
    $log(`[PSINFO] MSG: START ${actorName}`)
    $log(`[PSINFO] MSG: Finding FreeOnes page for ${actorName}`);
    const freeones_url =
        `https://www.freeones.xxx/${actorName.replace(/ /g, "-")}/profile`;
    let freeones_html = "";

    var freeones_response = (await $axios.get(freeones_url, {
        validateStatus: false
    }));
    if (freeones_response.status == 200) {
        freeones_html = freeones_response.data;
        const $ = $cheerio.load(freeones_html);
        const first = $(".profile-meta-item a").toArray()[0];
        const href = $(first).attr("href");
        $log("[PSINFO] MSG: Finding Date of Birth");
        const yyyymmdd = href.match(/\d\d\d\d-\d\d-\d\d/);
        if (yyyymmdd && yyyymmdd.length) {
            const date = yyyymmdd[0];
            const timestamp = $moment(date, "YYYY-MM-DD").valueOf();
            $log("[PSINFO] MSG: Date of Birth retrieved successfully");
            result["bornOn"] = timestamp;
        } else {
            $log(
                "[PSINFO] ERR: Date of Birth not found on FreeOnes, will extract from BabePedia in next version"
            );
        }
        const freeones_actor_images = $(".img-fluid").toArray();
        const freeones_actor_image_url = $(freeones_actor_images[0]).attr(
            "src").split("?")[0];
        // FreeOnes uses a placeholder image when no image is present. Do not download if placeholder image is found.
        try {
            if (!freeones_actor_image_url.endsWith("no-image-teaser.png")) {
                $log("[PSINFO] MSG: Found potential image for Actor at: " +
                    freeones_actor_image_url);
                const freeones_imgid = await $createImage(
                    freeones_actor_image_url,
                    `${actorName} (profile picture)`
                );
                // FreeOnes Profile Images look great as Avatars as they're primarily portraits
                if (freeones_imgid) {
                    $log("[PSINFO] MSG: Image set as Avatar");
                    result["avatar"] = freeones_imgid;
                } else {
                    $log(
                        "[PSINFO] ERR: Could not download image from FreeOnes"
                    )
                }
            } else {
                $log(
                    "[PSINFO] ERR: FreeOnes page has a placeholder image. Skipping..."
                );
            }
        } catch (err) {
            $log("[PSINFO] ERR: Could not download image from FreeOnes");
        }

    } else {
        $log("[PSINFO] ERR: Could not find FreeOnes page");
    }
    // Extract Actor aliases and up to two images from BabePedia
    const bpedia_profile_url =
        `https://www.babepedia.com/babe/${actorName.replace(/ /g, "_")}`;
    $log(`[PSINFO] MSG: Finding BabePedia page for ${actorName}`);
    const bpedia_response = (await $axios.get(bpedia_profile_url, {
        validateStatus: false
    }));
    if (bpedia_response.status == 200) {
        const bpedia_page_content = bpedia_response.data;
        const bpedia_cheerio = $cheerio.load(bpedia_page_content);
        $log("[PSINFO] MSG: Looking for Aliases");
        const raw_aliases = bpedia_cheerio("#bioarea h2").html()
        let altthumb_extract_failed = false;
        // Sometimes there's an extra space in the Aliases section
        if (raw_aliases !== null && (raw_aliases.startsWith("aka  ") ||
                raw_aliases.startsWith("aka "))) {
            // Split aliases by a slash into a list
            const alias_list = raw_aliases.replace("aka  ", "").replace(
                "aka ", "").split(" / ");
            result["aliases"] = alias_list;
        } else {
            $log("[PSINFO] MSG: No alias found on BabePedia");
        }
        // This specific URL usually works great as an alternate thumbnail
        const bpedia_thumb_url = bpedia_cheerio("#profimg a").attr("href");
        const bpedia_altthumb_element = bpedia_cheerio(".prof a")[0];
        if (bpedia_altthumb_element) {
            try {
                const bpedia_altthumb_url = "https://www.babepedia.com" +
                    bpedia_altthumb_element["attribs"]["href"];
                $log("[PSINFO] MSG: Found potential image");
                const bpedia_altthumb_imgid = await $createImage(
                    bpedia_altthumb_url,
                    `${actorName} (altthumb)`
                );
                result["altThumbnail"] = bpedia_altthumb_imgid;
                $log("[PSINFO] MSG: Image set as Alternate Thumbnail");
            } catch (err) {
                $log("[PSINFO] ERR: Could not download image from BabePedia",
                    err);
                altthumb_extract_failed = true;
            }
        }
        // This specific URL usually works great as the primary thumbnail
        if (bpedia_thumb_url !== undefined && !bpedia_thumb_url.startsWith(
                "javascript:alert")) {
            const bpedia_thumbnail_url = "https://www.babepedia.com" +
                bpedia_thumb_url;
            $log("[PSINFO] MSG: Found potential thumbnail image");
            const bpedia_thumbnail_imgid = await $createImage(
                bpedia_thumbnail_url,
                `${actorName} (thumb)`
            );
            if (bpedia_thumbnail_imgid) {
                $log("[PSINFO] MSG: Image set as Thumbnail");
                result["thumbnail"] = bpedia_thumbnail_imgid;
            } else {
                $log(
                    "[PSINFO] ERR: Could not download thumbnail image from BabePedia"
                );
                // Sometimes the alternate thumbnail download goes through but not the primary one
                // In such a case, we use the only image available as the primary thumbnail.
                if (!altthumb_extract_failed) {
                    $log(
                        "[PSINFO] MSG: Alt Image downloaded successfully but primary image failed...Swapping the two"
                    );
                    result["thumbnail"] = result["altThumbnail"];
                    result["altThumbnail"] = null;
                }
            }
        } else {
            $log("[PSINFO] ERR: Could not find image on BabePedia");
            if (result["avatar"]) {
                $log(
                    "[PSINFO] MSG: Using FreeOnes avatar image as thumbnail"
                    );
                result["thumbnail"] = result["avatar"];
            }
        }
    }
    // Enjoy!
    $log(`[PSINFO] MSG: END ${actorName}`)
    return result;
};
