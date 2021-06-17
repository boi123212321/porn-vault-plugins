const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");
const indulgeUsResult = require("./indulge_us.fixture");
const wildAndWetResult = require("./wild_and_wet.fixture");

const runPlugin = createPluginRunner("vixen_network", plugin);

const fixture = [
  ["Agatha Vega, Ginebra Bellucci Indulge Us Tushy Raw [facial, threesome].mp4", indulgeUsResult],
  ["Agatha Vega, Ginebra Bellucci Indulge Us TushyRaw [facial, threesome].mp4", indulgeUsResult],
  ["Agatha Vega, Ginebra Bellucci Indulge Us Tushyraw [facial, threesome].mp4", indulgeUsResult],
  ["Avery Cristy Jill Kassidy Wild And Wet Vixen.avi", wildAndWetResult],
];

describe("VIXEN network", () => {
  for (const [path, expected] of fixture) {
    it(`Should work for ${path}`, async () => {
      const result = await runPlugin({
        event: "sceneCreated",
        sceneName: "?????????????",
        scene: {
          _id: "xxx",
          name: "?????????????",
          path,
        },
      });
      expect(result.name).to.equal(expected.name);
      expect(result.releaseDate).to.equal(expected.releaseDate);
      expect(result.description).to.equal(expected.description);
      expect(result.actors).to.deep.equal(expected.actors);
      expect(result.custom).to.deep.equal(expected.custom);
      expect(result.labels).to.deep.equal(expected.labels);
      expect(result.$thumbnail).to.be.a("string").that.contains("TRIPPLE");
      expect(result.thumbnail).to.be.undefined;
      expect(result.$markers).to.have.length(0);
    });
  }
});
