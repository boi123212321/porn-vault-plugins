const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");

const runPlugin = createPluginRunner("vixen_network", plugin);

describe("VIXEN network", () => {
  it(`Should work with chapters`, async () => {
    const result = await runPlugin({
      event: "sceneCreated",
      sceneName: "?????????????",
      scene: {
        _id: "xxx",
        name: "?????????????",
        path: "Agatha Vega, Ginebra Bellucci Indulge Us Tushy Raw [facial, threesome].mp4",
      },
      args: {
        useChapters: true,
      },
    });
    expect(result.$markers).to.have.length(12);
    expect(result.$markers[0].name).to.equal("Kissing");
    expect(result.$markers[1].name).to.equal("Ass Toying");
    expect(result.$markers[11].name).to.equal("Cumshot");
  });
});
