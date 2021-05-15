const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");

const runPlugin = createPluginRunner("freeones", plugin);

function search(args = {}) {
  return runPlugin({
    actorName: "Haley Reed",
    args,
  });
}

describe("freeones", () => {
  it("Search 'Haley Reed'", async () => {
    const result = await search();
    expect(result.custom).to.deep.equal({
      "hair color": "Blonde",
      "eye color": "Green",
      ethnicity: "Caucasian",
      height: 178,
      weight: 54,
      zodiac: "Sagittarius",
      measurements: "34B-24-35",
      "waist size": 24,
      "hip size": 35,
      "cup size": "B",
      birthplace: "Orlando, FL",
      "bra size": "34B",
      "bust size": 34,
      started: 2016,
      gender: "Female",
      sex: "Female",
      piercings: "Nipple Rings; Septum",
      tattoos:
        'Crescent Moon With Face Upper Back; Flowers Above Both Knees; "They Cant All Be Zingers" Middle Back; Script On Inside Left Forearm',
    });
    expect(result.nationality).to.equal("US");
    expect(result.bornOn).to.be.a("number");
    expect(result.labels).to.have.length.greaterThan(0);
    expect(result.labels).to.contain("Blonde Hair");
    expect(result.labels).to.contain("Green Eyes");
    expect(result.labels).to.contain("Caucasian");
    expect(result.labels).to.contain("Female");
    expect(result.labels).to.contain("Piercings");
    expect(result.labels).to.contain("Tattoos");
  });

  it("Search 'Haley Reed', tattoos as array", async () => {
    const result = await search({ tattoosType: "array" });
    expect(result.custom).to.deep.equal({
      "hair color": "Blonde",
      "eye color": "Green",
      ethnicity: "Caucasian",
      height: 178,
      weight: 54,
      zodiac: "Sagittarius",
      measurements: "34B-24-35",
      "waist size": 24,
      "hip size": 35,
      "cup size": "B",
      birthplace: "Orlando, FL",
      "bra size": "34B",
      "bust size": 34,
      started: 2016,
      gender: "Female",
      sex: "Female",
      piercings: "Nipple Rings; Septum",
      tattoos: [
        "Crescent Moon With Face Upper Back",
        "Flowers Above Both Knees",
        '"They Cant All Be Zingers" Middle Back',
        "Script On Inside Left Forearm",
      ],
    });
    expect(result.nationality).to.equal("US");
    expect(result.bornOn).to.be.a("number");
    expect(result.labels).to.have.length.greaterThan(0);
    expect(result.labels).to.contain("Blonde Hair");
    expect(result.labels).to.contain("Green Eyes");
    expect(result.labels).to.contain("Caucasian");
    expect(result.labels).to.contain("Female");
    expect(result.labels).to.contain("Piercings");
    expect(result.labels).to.contain("Tattoos");
  });
});
