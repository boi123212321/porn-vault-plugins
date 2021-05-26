import moment from "moment";
const { createPluginRunner } = require("../../../context");
const plugin = require("../main");
const { expect } = require("chai");

const runPlugin = createPluginRunner("fileparser", plugin);

describe("fileparser", () => {
  it("Should fail", async () => {
    let errord = false;
    try {
      await runPlugin();
    } catch (error) {
      expect(error.message).to.equal("Uh oh. You shouldn't use the plugin for this type of event");
      errord = true;
    }
    expect(errord).to.be.true;
  });
  it("Parsing YYYY dates...", async () => {
    const result = await runPlugin({
      scenePath: "/dummy scene name (2019).mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("2019", "YYYY").valueOf());
  });
  it("Parsing YYYY-MM dates...", async () => {
    const result = await runPlugin({
      scenePath: "/dummy scene 1984_03 name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-03", "YYYY-MM").valueOf());
  });
  it("Parsing MM-YYYY dates...", async () => {
    const result = await runPlugin({
      scenePath: "/dummy scene name 03-1984.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-03", "YYYY-MM").valueOf());
  });
  it("Parsing YYYY-MM-DD dates variant 1...", async () => {
    const result = await runPlugin({
      scenePath: "/1984.03.17 dummy scene name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-03-17", "YYYY-MM-DD").valueOf());
  });
  it("Parsing YYYY-MM-DD dates variant 2...", async () => {
    const result = await runPlugin({
      scenePath: "/1984.12.07 dummy scene name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-12-07", "YYYY-MM-DD").valueOf());
  });
  it("Parsing YY-MM-DD dates...", async () => {
    const result = await runPlugin({
      scenePath: "/dummy scene _84_03_07_ name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-03-07", "YYYY-MM-DD").valueOf());
  });
  it("Parsing DD-MM-YY dates...", async () => {
    const result = await runPlugin({
      scenePath: "/dummy scene 27 03-84 name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-03-27", "YYYY-MM-DD").valueOf());
  });
  it("Parsing DD-MM-YYYY dates variant 1...", async () => {
    const result = await runPlugin({
      scenePath: "/_30_12.1984_ dummy scene name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-12-30", "YYYY-MM-DD").valueOf());
  });
  it("Parsing DD-MM-YYYY dates variant 2...", async () => {
    const result = await runPlugin({
      scenePath: "07-03-1984 dummy scene name.mp4",
      args: {},
    });
    expect(result.releaseDate).to.equal(moment("1984-03-07", "YYYY-MM-DD").valueOf());
  });
  it("Matching all properties: releaseDate, name, studio, actors, movie and labels (JSON config, sceneName does not match actual file name)", async () => {
    const base = "Studio name ~ first1 last1 , first2 last2 ~ Scene title ~ 2017-12-31";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/completeMultiMatch/movies/movie series/Movie Name 17/${base}.mp4`,
      sceneName: "Should not be used...",
      args: {},
      $library: "./plugins/fileparser/test/fixtures/completeMultiMatch/movies/",
    });
    expect(result.releaseDate).to.equal(moment("2017-12-31", "YYYY-MM-DD").valueOf());
    expect(result.studio).to.equal("Studio name");
    expect(result.name).to.equal("Scene title");
    expect(result.actors).to.be.an("array").to.have.lengthOf(2);
    expect(result.actors).to.include("first1 last1");
    expect(result.actors).to.include("first2 last2");
    expect(result.movie).to.equal("Movie Name 17");
    expect(result.labels).to.be.an("array").to.have.lengthOf(2);
    expect(result.labels).to.include("movies");
    expect(result.labels).to.include("movie series");
  });
  it("Invalid config (YAML config)", async () => {
    const base = "Studio name ~ first1 last1 , first2 last2 ~ Scene title ~ 2017_12_31";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/invalidConfig/movies/movie series/Movie Name 17/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.releaseDate).to.equal(moment("2017-12-31", "YYYY-MM-DD").valueOf());
    expect(result.studio).to.be.undefined;
    expect(result.name).to.be.undefined;
    expect(result.actors).to.be.undefined;
    expect(result.movie).to.be.undefined;
    expect(result.labels).to.be.be.undefined;
  });
  it("Invalid config (JSON config)", async () => {
    const base = "Studio name ~ first1 last1 , first2 last2 ~ Scene title ~ 2017_12_31";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/invalidJsonConfig/movies/movie series/Movie Name 17/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.releaseDate).to.equal(moment("2017-12-31", "YYYY-MM-DD").valueOf());
    expect(result.studio).to.be.undefined;
    expect(result.name).to.be.undefined;
    expect(result.actors).to.be.undefined;
    expect(result.movie).to.be.undefined;
    expect(result.labels).to.be.be.undefined;
  });
  it("Empty config", async () => {
    const base = "Studio name ~ first1 last1 , first2 last2 ~ Scene title ~ 2017_12_31";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/emptyConfig/movies/movie series/Movie Name 17/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.releaseDate).to.equal(moment("2017-12-31", "YYYY-MM-DD").valueOf());
    expect(result.studio).to.be.undefined;
    expect(result.name).to.be.undefined;
    expect(result.actors).to.be.undefined;
    expect(result.movie).to.be.undefined;
    expect(result.labels).to.be.be.undefined;
  });
  it("Full match, then split...", async () => {
    const base = "2017.02.09 - first1 last1 , first2 last2,  first3 last3 ";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/fullMatch/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.releaseDate).to.equal(moment("2017-02-09", "YYYY-MM-DD").valueOf());
    expect(result.actors).to.be.an("array").to.have.lengthOf(3);
    expect(result.actors).to.include("first1 last1");
    expect(result.actors).to.include("first2 last2");
    expect(result.actors).to.include("first3 last3");
  });
  it("Multiple matches, multiple groups...", async () => {
    const base = "first matched group - second matched group - third matched group";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/groupsMatch/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.actors).to.be.an("array").to.have.lengthOf(3);
    expect(result.actors).to.include("first matched group");
    expect(result.actors).to.include("second matched group");
    expect(result.actors).to.include("third matched group");
  });
  it("single match and group", async () => {
    const base = "single match here";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/groupsMatch/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.actors).to.be.an("array").to.have.lengthOf(1);
    expect(result.actors).to.include("single match here");
  });
  it("Character Replacement", async () => {
    const base = "Studio.Name.21.01.01.Some.Title.Name.XXX.2160p.MP4-???";
    const result = await runPlugin({
      scenePath: `./plugins/fileparser/test/fixtures/characterReplacement/${base}.mp4`,
      args: {},
      $library: "/",
    });
    expect(result.releaseDate).to.equal(moment("2021-01-01", "YYYY-MM-DD").valueOf());
    expect(result.studio).to.equal('Studio Name');
    expect(result.name).to.be.equal('Some Title Name');
  });
});
