const context = require("../../../context");
const plugin = require("../main");
const { expect } = require("chai");

describe("adultempire", () => {
  it("Should fetch covers & studio name from page", async () => {
    console.log("Fetching adultempire.com...");
    const result = await plugin({
      ...context,
      movieName: "tushy raw v5",
      args: {},
    });
    expect(result).to.be.an("object");
    expect(result.frontCover).to.be.a("string");
    expect(result.backCover).to.be.a("string");
    expect(result.studio).to.be.a("string").equal("Tushy Raw");
  });

  it("Should not fetch covers etc (404)", async () => {
    console.log("Fetching adultempire.com...");
    const result = await plugin({
      ...context,
      movieName: "fasdfawbwaerawerawebr",
      args: {},
    });
    expect(result).to.deep.equal({});
  });
});
