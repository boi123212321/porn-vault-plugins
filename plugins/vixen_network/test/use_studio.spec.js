const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");
const indulgeUsResult = require("./indulge_us.fixture");

const runPlugin = createPluginRunner("vixen_network", plugin);

const fixture = [
  ["Agatha Vega, Ginebra Bellucci Indulge Us.mp4", indulgeUsResult],
  ["Indulge Us.mp4", indulgeUsResult],
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
        async $getStudio() {
          return {
            name: "TUSHY RAW",
          };
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
