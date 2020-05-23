const context = require("../../../context");
const plugin = require("../main");
const { expect } = require("chai");

describe("adultempire", () => {
  it("Should find a thumbnail", async () => {
    const result = await plugin({
      ...context,
      actorName: "001",
      args: {
        path_thumb: "./plugins/profile_pics/test/fixtures",
      },
    });
    expect(result).to.be.an("object");
    expect(result.thumbnail).to.be.a("string");
  });

  it("Should find no image", async () => {
    const result = await plugin({
      ...context,
      actorName: "003",
      args: {
        path_thumb: "./plugins/profile_pics/test/fixtures",
      },
    });
    expect(result).to.be.an("object");
    expect(result.thumbnail).to.be.undefined;
  });

  it("Should find a thumbnail", async () => {
    const result = await plugin({
      ...context,
      actorName: "001",
      args: {
        path_hero: "./plugins/profile_pics/test/fixtures",
      },
    });
    expect(result).to.be.an("object");
    expect(result.hero).to.be.a("string");
  });

  it("Should find no image", async () => {
    const result = await plugin({
      ...context,
      actorName: "003",
      args: {
        path_hero: "./plugins/profile_pics/test/fixtures",
      },
    });
    expect(result).to.be.an("object");
    expect(result.hero).to.be.undefined;
  });
});
