const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");

const runPlugin = createPluginRunner("freeones", plugin);

function search(args = {}) {
  return runPlugin({
    actorName: "Gia DiMarco",
    args,
  });
}

describe("freeones", () => {
  it("Search 'Gia DiMarco'", async () => {
    const result = await search({
      dry: false,
      blacklist: ["avatar"],
      useImperial: false,
      useAvatarAsThumbnail: false,
    });
    expect(result.custom).to.deep.equal({
      "hair color": "Brown",
      "eye color": "Brown",
      ethnicity: "Caucasian",
      height: 163,
      weight: 50,
      birthplace: "San Francisco, CA",
      zodiac: "Scorpio",
      measurements: "34D-24-35",
      "waist size": 24,
      "hip size": 35,
      "cup size": "D",
      "bust size": 34,
      "bra size": "34D",
      gender: "Female",
      sex: "Female",
      started: 2005,
      piercings: "Left Nostril; Clitoris",
      tattoos:
        'Small Stars Behind Right Ear; 2 Red Flowers With Leaves Upper Back; Large Design Of Flames, Wings And 6 Red Roses Lower Back; "La Bella Vita" Left Side Of Torso; Traces Of Removed Floral Right Hip; Cherries, Hearts And Stars Above Of Pubes; Nautical Motif',
    });
    expect(result.nationality).to.equal("US");
    expect(result.bornOn).to.be.a("number");
    expect(result.avatar).to.be.undefined;
    expect(result.thumbnail).to.be.undefined;
    expect(result.labels).to.have.length.greaterThan(0);
    expect(result.labels).to.contain("Brown Hair");
    expect(result.labels).to.contain("Brown Eyes");
    expect(result.labels).to.contain("Caucasian");
    expect(result.labels).to.contain("Female");
    expect(result.labels).to.contain("Piercings");
    expect(result.labels).to.contain("Tattoos");
  });

  it("Search 'Gia DiMarco' without measurements", async () => {
    const result = await search({
      dry: false,
      blacklist: ["measurements", "avatar"],
      useImperial: false,
      useAvatarAsThumbnail: true,
    });
    expect(result.custom).to.deep.equal({
      "hair color": "Brown",
      "eye color": "Brown",
      ethnicity: "Caucasian",
      height: 163,
      weight: 50,
      birthplace: "San Francisco, CA",
      zodiac: "Scorpio",
      gender: "Female",
      sex: "Female",
      started: 2005,
      piercings: "Left Nostril; Clitoris",
      tattoos:
        'Small Stars Behind Right Ear; 2 Red Flowers With Leaves Upper Back; Large Design Of Flames, Wings And 6 Red Roses Lower Back; "La Bella Vita" Left Side Of Torso; Traces Of Removed Floral Right Hip; Cherries, Hearts And Stars Above Of Pubes; Nautical Motif',
    });
    expect(result.nationality).to.equal("US");
    expect(result.bornOn).to.be.a("number");
    expect(result.avatar).to.be.undefined;
    expect(result.thumbnail).to.be.a("string");
    expect(result.labels).to.have.length.greaterThan(0);
    expect(result.labels).to.contain("Brown Hair");
    expect(result.labels).to.contain("Brown Eyes");
    expect(result.labels).to.contain("Caucasian");
    expect(result.labels).to.contain("Female");
    expect(result.labels).to.contain("Piercings");
    expect(result.labels).to.contain("Tattoos");
  });
});
