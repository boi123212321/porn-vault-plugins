async ({ event, args, $axios, $moment, $cheerio, $throw, $log, actorName }) => {
  if (event != "actorCreated" && event != "actorCustom")
    $throw("Uh oh. You shouldn't use the plugin for this type of event");

  $log(`Scraping freeones birth date for ${actorName}, dry mode: ${args.dry || false}...`);

  const url = `https://freeones.xxx/${actorName.replace(/ /g, "-")}/profile`;
  $log("Getting " + url);
  const html = (await $axios.get(url)).data;
  const $ = $cheerio.load(html);

  const first = $(".profile-meta-item a").toArray()[0];
  const href = $(first).attr("href");

  const yyyymmdd = href.match(/\d\d\d\d-\d\d-\d\d/);

  if (yyyymmdd && yyyymmdd.length) {
    const date = yyyymmdd[0];

    const timestamp = $moment(date, "YYYY-MM-DD").valueOf();

    if (args.dry === true) {
      $log("Actor birth date: " + new Date(timestamp).toLocaleDateString());
      return {};
    }
    return {
      bornOn: timestamp
    };
  } else {
    $throw("Could not find actor birth date.");
  }
};
