const { createPluginRunner } = require("../../../context");
const plugin = require("../main");
const { expect } = require("chai");
import fs from "fs";

const runPlugin = createPluginRunner("fileorganizer", plugin);

describe("fileorganizer", () => {
  beforeEach(function () {
    fs.rmdirSync("./plugins/fileorganizer/test/fixtures/temp", { recursive: true });
    fs.mkdirSync("./plugins/fileorganizer/test/fixtures/temp");
  });

  afterEach(function () {
    fs.rmdirSync("./plugins/fileorganizer/test/fixtures/temp", { recursive: true });
  });

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

  describe("Normal behavior...", () => {
    it("Should rename with a mix of initial data and plug-in piped data, while ignoring non relevant or duplicate data", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "Initial scene name",
          releaseDate: new Date(2015, 10, 20).valueOf(),
        },
        sceneName: "Should be ignored",
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        data: {
          actors: ["Last1 First1", "Last2 First2"],
          releaseDate: new Date(2020, 10, 20).valueOf(),
        },
        args: {
          fileStructureTemplate:
            "{<studio>} _ignore text between blocks_ { ~ <releasedate>}{ ~ <ACTORS>}{ ~ <nAme>}{ (<movies2>)}",
        },
        $getActors: async () => [{ name: "Tobe Ignored" }, { name: "Tobe Ignored" }],
        $getMovies: async () => [{ name: "InitialMovie1" }, { name: "InitialMovie2" }],
        $getStudio: async () => {
          return { name: "InitialStudio" };
        },
      });
      expect(result.path).to.equal(
        "./plugins/fileorganizer/test/fixtures/temp/InitialStudio ~ 2020-11-20 ~ Last1 First1, Last2 First2 ~ Initial scene name (InitialMovie2).txt"
      );
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(
        fs.existsSync(
          "./plugins/fileorganizer/test/fixtures/temp/InitialStudio ~ 2020-11-20 ~ Last1 First1, Last2 First2 ~ Initial scene name (InitialMovie2).txt"
        )
      ).to.be.true;
    });
    it("Should use all supported template fields from piped data", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        name: "NAME",
        releaseDate: new Date(2018, 10, 20).valueOf(),
        rating: 7,
        scene: {
          meta: {
            duration: 1024,
            dimensions: { width: 4096, height: 2160 },
          },
        },
        sceneName: "Should be ignored",
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        data: {
          name: "_NAME",
          actors: ["_ACTORS"],
          studio: "_STUDIO",
          releaseDate: new Date(2020, 10, 20).valueOf(),
          rating: 8,
          movie: "_MOVIE",
          labels: ["_LABELS"],
        },
        args: {
          fileStructureTemplate:
            "{n.<name> }{d.<releaseDate> }{r.<rating> }{h.<videoHeight>p }{w.<videoWidth> }{d.<videoDuration> }{a.<actors> }{s.<studio> }{m.<movies> }{l.<labels>}",
        },
        $getActors: async () => [{ name: "ACT1" }, { name: "ACT2" }],
        $getMovies: async () => [{ name: "MOV1" }, { name: "MOV2" }],
        $getLabels: async () => [{ name: "LAB1" }, { name: "LAB2" }],
        $getStudio: async () => {
          return { name: "STUDIO" };
        },
      });
      expect(result.path).to.equal(
        "./plugins/fileorganizer/test/fixtures/temp/n._NAME d.2020-11-20 r.8 h.2160p w.4096 d.17∶04 a._ACTORS s._STUDIO m._MOVIE l._LABELS.txt"
      );
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(
        fs.existsSync(
          "./plugins/fileorganizer/test/fixtures/temp/n._NAME d.2020-11-20 r.8 h.2160p w.4096 d.17∶04 a._ACTORS s._STUDIO m._MOVIE l._LABELS.txt"
        )
      ).to.be.true;
    });
    it("Should use all supported template fields from the scene's initial data (via server functions)", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "NAME",
          releaseDate: new Date(2018, 10, 23).valueOf(),
          rating: 7,
          meta: {
            duration: 1024,
            dimensions: { width: 4096, height: 2160 },
          },
        },
        sceneName: "Should be ignored",
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate:
            "{n.<name> }{d.<releaseDate> }{r.<rating> }{h.<videoHeight>p }{w.<videoWidth> }{d.<videoDuration> }{a.<actors> }{s.<studio> }{m.<movies> }{l.<labels>}",
        },
        $getActors: async () => [{ name: "ACT1" }, { name: "ACT2" }],
        $getMovies: async () => [{ name: "MOV1" }, { name: "MOV2" }],
        $getLabels: async () => [{ name: "LAB1" }, { name: "LAB2" }],
        $getStudio: async () => {
          return { name: "STUDIO" };
        },
      });
      expect(result.path).to.equal(
        "./plugins/fileorganizer/test/fixtures/temp/n.NAME d.2018-11-23 r.7 h.2160p w.4096 d.17∶04 a.ACT1, ACT2 s.STUDIO m.MOV1, MOV2 l.LAB1, LAB2.txt"
      );
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(
        fs.existsSync(
          "./plugins/fileorganizer/test/fixtures/temp/n.NAME d.2018-11-23 r.7 h.2160p w.4096 d.17∶04 a.ACT1, ACT2 s.STUDIO m.MOV1, MOV2 l.LAB1, LAB2.txt"
        )
      ).to.be.true;
    });
    it("Should not rename when a mandatory field has no value", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "Initial scene name",
        },
        sceneName: "Should be ignored",
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<studio!>}{ ~ <name>}",
        },
        $getStudio: async () => {},
      });
      expect(result.path).to.be.undefined;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.true;
    });
    it("Should rename with allowed initial data on sceneCreate events...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCreated",
        data: {
          name: "Initial scene name"
        },
        scene: {
          meta: { dimensions: {width: 1920, height: 1080}, duration: 90}
        },
        sceneName: "Should be ignored",
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<name!>}{ (<videoHeight!>p)}",
        },
      });
      expect(result.path).to.equal("./plugins/fileorganizer/test/fixtures/temp/Initial scene name (1080p).txt");
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/Initial scene name (1080p).txt")).to.be.true;
    });
    it("Should not rename with unsafe initial data on sceneCreate events...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCreated",
        scene: {
          name: "Initial scene name",
          meta: { dimensions: {width: 1920, height: 1080}, duration: 90}
        },
        sceneName: "Should be ignored",
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<name!>}{ (<videoHeight!>p)}",
        },
      });
      expect(result.path).to.be.undefined;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.true;
    });
  });

  describe("Name normalize & sanitize...", () => {
    it("Should remove all illegal characters and use custom replacements from args...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name:
            'Dirty  scene? ...not the kind if "dirty" you\'re thinking about, Chloé! :+) / ? < >  : * |',
        },
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<name>}",
          normalizeAccents: true,
          normalizeMultipleSpaces: true,
          characterReplacement: [
            { original: ":", replacement: " - " },
            { original: "|", replacement: "," },
          ],
        },
      });
      expect(result.path).to.equal(
        "./plugins/fileorganizer/test/fixtures/temp/Dirty scene ...not the kind if dirty you're thinking about, Chloe! - +) ,.txt"
      );
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(
        fs.existsSync(
          "./plugins/fileorganizer/test/fixtures/temp/Dirty scene ...not the kind if dirty you're thinking about, Chloe! - +) ,.txt"
        )
      ).to.be.true;
    });
    it("Should remove illegal characters, but not normalize...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name:
            "Yëëp, what <b>a   strânge</b> filename! These look like illegal chars, but are allowed ∶",
        },
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<name>}",
          normalizeAccents: false,
          normalizeMultipleSpaces: false,
        },
      });
      expect(result.path).to.equal(
        "./plugins/fileorganizer/test/fixtures/temp/Yëëp, what ba   strângeb filename! These look like illegal chars, but are allowed ∶.txt"
      );
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(
        fs.existsSync(
          "./plugins/fileorganizer/test/fixtures/temp/Yëëp, what ba   strângeb filename! These look like illegal chars, but are allowed ∶.txt"
        )
      ).to.be.true;
    });
  });

  describe("Name conflicts handling...", () => {
    it("Should rename with counter suffix...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "Original");
      fs.writeFileSync(
        "./plugins/fileorganizer/test/fixtures/temp/renamed.txt",
        "Should not be modified"
      );
      fs.writeFileSync(
        "./plugins/fileorganizer/test/fixtures/temp/renamed(1).txt",
        "Should not be modified"
      );
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "renamed",
        },
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<name>}",
          nameConflictHandling: "rename",
        },
      });
      expect(result.path).to.equal("./plugins/fileorganizer/test/fixtures/temp/renamed(2).txt");
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.false;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/renamed.txt")).to.be.true;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/renamed(1).txt")).to.be.true;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/renamed(2).txt")).to.be.true;
      expect(
        fs.readFileSync("./plugins/fileorganizer/test/fixtures/temp/renamed.txt", {
          encoding: "utf8",
        })
      ).to.equal("Should not be modified");
      expect(
        fs.readFileSync("./plugins/fileorganizer/test/fixtures/temp/renamed(1).txt", {
          encoding: "utf8",
        })
      ).to.equal("Should not be modified");
      expect(
        fs.readFileSync("./plugins/fileorganizer/test/fixtures/temp/renamed(2).txt", {
          encoding: "utf8",
        })
      ).to.equal("Original");
    });
    it("Should skip rename...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "Original");
      fs.writeFileSync(
        "./plugins/fileorganizer/test/fixtures/temp/renamed.txt",
        "Should be skipped"
      );
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "renamed",
        },
        scenePath: "./plugins/fileorganizer/test/fixtures/temp/original.txt",
        args: {
          fileStructureTemplate: "{<name>}",
          nameConflictHandling: "skip",
        },
      });
      expect(result.path).to.be.undefined;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.true;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/renamed.txt")).to.be.true;
      expect(
        fs.readFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", {
          encoding: "utf8",
        })
      ).to.equal("Original");
      expect(
        fs.readFileSync("./plugins/fileorganizer/test/fixtures/temp/renamed.txt", {
          encoding: "utf8",
        })
      ).to.equal("Should be skipped");
    });
  });

  describe("Invalid arguments...", () => {
    it("Should not rename if an unknown field is used in template...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "a simple scene name",
        },
        scenePath: "/dir/a simple scene name.mp4",
        args: {
          fileStructureTemplate: "{<naaame>}",
        },
      });
      expect(result.path).to.be.undefined;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.true;
    });
    it("Should not rename if an unknown field argument is used in template...", async () => {
      fs.writeFileSync("./plugins/fileorganizer/test/fixtures/temp/original.txt", "");
      const result = await runPlugin({
        event: "sceneCustom",
        scene: {
          name: "a simple scene name",
        },
        scenePath: "/dir/a simple scene name.mp4",
        args: {
          fileStructureTemplate: "{<name?>}",
        },
      });
      expect(result.path).to.be.undefined;
      expect(fs.existsSync("./plugins/fileorganizer/test/fixtures/temp/original.txt")).to.be.true;
    });
  });
});
