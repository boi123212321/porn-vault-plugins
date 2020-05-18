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

  const thumbPath = $path.resolve(args.path_thumb);
  const altPath = $path.resolve(args.path_alt);
  const avatarPath = $path.resolve(args.path_avatar);
  const heroPath = $path.resolve(args.path_hero);

  if (!thumbPath) $throw("Missing thumbnail folder path!");
  if (!altPath) $throw("Missing alt-thumbnail folder path!");
  if (!avatarPath) $throw("Missing avatar folder path!");
  if (!heroPath) $throw("Missing hero folder path!");

  const exts = [".jpg", ".png", ".gif"];

  $log(`Trying to find thumbnail pictures of ${actorName} in ${thumbPath}`);

  const thumbfiles = $fs.readdirSync(thumbPath);
  const thumbhit = thumbfiles.find((thumbname) =>
    thumbname.toLowerCase().includes(actorName.toLowerCase())
  );
  
  $log(`Trying to find alt thumbnail pictures of ${actorName} in ${altPath}`);
  
  const altfiles = $fs.readdirSync(altPath);
  const althit = altfiles.find((altname) =>
    altname.toLowerCase().includes(actorName.toLowerCase())
  );
  
  $log(`Trying to find avatar pictures of ${actorName} in ${avatarPath}`);

  const avatarfiles = $fs.readdirSync(avatarPath);
  const avatarhit = avatarfiles.find((avatarname) =>
    avatarname.toLowerCase().includes(actorName.toLowerCase())
  );
  
  $log(`Trying to find hero pictures of ${actorName} in ${heroPath}`);
  
  const herofiles = $fs.readdirSync(heroPath);
  const herohit = herofiles.find((heroname) =>
    heroname.toLowerCase().includes(actorName.toLowerCase())
  );

  //Thumbnail definition

  if (thumbhit && exts.some((ext) => thumbhit.endsWith(ext))) {
    $log(`Found thumbnail picture for ${actorName}`);
    var thumb_image = await $createLocalImage(
      $path.join(thumbPath, thumbhit),
      actorName,
      true
    );
  }
  
  //Alt Thumbnail definition
  
  if (althit && exts.some((ext) => althit.endsWith(ext))) {
    $log(`Found alt thumbnail picture for ${actorName}`);
    var alt_image = await $createLocalImage(
      $path.join(altPath, althit),
      actorName,
      true
    );
  }
  
  //Avatar definition
  
  if (avatarhit && exts.some((ext) => avatarhit.endsWith(ext))) {
    $log(`Found avatar picture for ${actorName}`);
    var avatar_image = await $createLocalImage(
      $path.join(avatarPath, avatarhit),
      actorName,
      true
    );
  }
  
  //Hero definition
  
  if (herohit && exts.some((ext) => herohit.endsWith(ext))) {
    $log(`Found hero picture for ${actorName}`);
    var hero_image = await $createLocalImage(
      $path.join(heroPath, herohit),
      actorName,
      true
    );
  }
  
  return {
    [args.target_thumb || thumbnail]: thumb_image,
	  [args.target_alt || altThumbnail]: alt_image,
	  [args.target_avatar || avatar]: avatar_image,
	  [args.target_hero || hero]: hero_image,
    };
  
  $log(`Found no picture for ${actorName}`);
  return {};
};
