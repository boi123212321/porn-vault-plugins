module.exports = async ({
  args,
  $throw,
  $log,
  actorName,
  $createLocalImage,
  $fs,
  $path,
}) => {
  if (!actorName)
    $throw("Uh oh. You shouldn't use the plugin for this type of event");

  const exts = [".jpg", ".png", ".jpeg", ".gif"];

  async function scanFolder(partial, prop) {
    if (!partial) {
      $log(`No ${prop} path defined`);
      return {};
    }

    const path = $path.resolve(partial);

    $log(`Trying to find ${prop} pictures of ${actorName} in ${path}`);

    const files = $fs.readdirSync(path);
    const hit = files.find((name) =>
      name.toLowerCase().includes(actorName.toLowerCase())
    );

    if (hit && exts.some((ext) => hit.endsWith(ext))) {
      $log(`Found ${prop} picture for ${actorName}`);
      var image = await $createLocalImage(
        $path.join(path, hit),
        actorName,
        true
      );
      return {
        [prop]: image,
      };
    }

    return {};
  }

  return {
    ...(await scanFolder(args["path_thumb"], "thumbnail")),
    ...(await scanFolder(args["path_alt"], "altThumbnail")),
    ...(await scanFolder(args["path_avatar"], "avatar")),
    ...(await scanFolder(args["path_hero"], "hero")),
  };
};
