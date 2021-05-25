import { createPluginRunner } from "../../../context";
import plugin from "../main";
import { manualTouchChoices } from "../util";
import { SwanOfSorrow } from "./fixtures/scenes";

const { expect } = require("chai");
const IMAGE_ID = "MOCK_IMAGE_ID";

const mockContext = {
  $createImage: () => IMAGE_ID,
};

const runPlugin = createPluginRunner("PromisedScene", plugin);

describe("PromisedScene", () => {
  describe("Handle all of the errors properly.", () => {
    it("Should fail with error:  Plugin used for unsupported event", async () => {
      let errord = false;
      try {
        await runPlugin({
          ...mockContext,
          event: "fake event",
          scene: {},
          $getStudio: async () => {},
          $getMovies: async () => [],
          $getActors: async () => [],
          args: {
            manualTouch: true,
            sceneDuplicationCheck: true,
            parseActor: true,
            parseStudio: true,
            parseDate: true,
            source_settings: {
              actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
              scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
              studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
            },
          },
          sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          scenePath:
            "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          testMode: {
            testSiteUnavailable: false,
            status: false,
          },
        });
      } catch (error) {
        expect(error.message).to.include("Plugin used for unsupported event");
        errord = true;
      }
      expect(errord).to.be.true;
    });
    it("Should fail with error:  Missing source_settings in plugin args", async () => {
      let errord = false;
      try {
        await runPlugin({
          ...mockContext,
          event: "sceneCreated",
          scene: {},
          $getStudio: async () => {},
          $getMovies: async () => [],
          $getActors: async () => [],
          args: {
            manualTouch: true,
            sceneDuplicationCheck: true,
            parseActor: true,
            parseStudio: true,
            parseDate: true,
          },
          sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          scenePath:
            "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          testMode: {
            testSiteUnavailable: false,
            status: true,
          },
        });
      } catch (error) {
        expect(error.message).to.include("Missing source_settings in plugin args");
        errord = true;
      }
      expect(errord).to.be.true;
    });
    it("Should fail with error:  Missing parseActor in plugin args", async () => {
      let errord = false;
      try {
        await runPlugin({
          ...mockContext,
          event: "sceneCreated",
          scene: {},
          $getStudio: async () => {},
          $getMovies: async () => [],
          $getActors: async () => [],
          args: {
            manualTouch: true,
            sceneDuplicationCheck: true,
            parseStudio: true,
            parseDate: true,
            source_settings: {
              actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
              scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
              studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
            },
          },
          sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          scenePath:
            "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          testMode: {
            testSiteUnavailable: false,
            status: true,
          },
        });
      } catch (error) {
        expect(error.message).to.include("Missing parseActor in plugin args");
        errord = true;
      }
      expect(errord).to.be.true;
    });
    it("Should fail with error:  Missing parseStudio in plugin args", async () => {
      let errord = false;
      try {
        await runPlugin({
          ...mockContext,
          event: "sceneCreated",
          scene: {},
          $getStudio: async () => {},
          $getMovies: async () => [],
          $getActors: async () => [],
          args: {
            manualTouch: true,
            sceneDuplicationCheck: true,
            parseActor: true,
            source_settings: {
              actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
              scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
              studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
            },
          },
          sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          scenePath:
            "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          testMode: {
            testSiteUnavailable: false,
            status: true,
          },
        });
      } catch (error) {
        expect(error.message).to.include("Missing parseStudio in plugin args");
        errord = true;
      }
      expect(errord).to.be.true;
    });
    it("Should fail with error:  Missing manualTouch in plugin args", async () => {
      let errord = false;
      try {
        await runPlugin({
          ...mockContext,
          event: "sceneCreated",
          scene: {},
          $getStudio: async () => {},
          $getMovies: async () => [],
          $getActors: async () => [],
          args: {
            sceneDuplicationCheck: true,
            parseActor: true,
            parseStudio: true,
            parseDate: true,
            source_settings: {
              actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
              scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
              studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
            },
          },
          sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          scenePath:
            "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          testMode: {
            testSiteUnavailable: false,
            status: true,
          },
        });
      } catch (error) {
        expect(error.message).to.include("Missing manualTouch in plugin args");
        errord = true;
      }
      expect(errord).to.be.true;
    });
    it("Should fail with error:  Missing sceneDuplicationCheck in plugin args", async () => {
      let errord = false;
      try {
        await runPlugin({
          ...mockContext,
          event: "sceneCreated",
          scene: {},
          $getStudio: async () => {},
          $getMovies: async () => [],
          $getActors: async () => [],
          args: {
            manualTouch: true,
            parseActor: true,
            parseStudio: true,
            parseDate: true,
            source_settings: {
              actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
              scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
              studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
            },
          },
          sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          scenePath:
            "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
          testMode: {
            testSiteUnavailable: false,
            status: true,
          },
        });
      } catch (error) {
        expect(error.message).to.include("Missing sceneDuplicationCheck in plugin args");
        errord = true;
      }
      expect(errord).to.be.true;
    });
  });

  describe("When Populated Databases exist...", () => {
    it("Should have DB files with the Actor, Studio, Scene and date already", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Should not return an actor with a single name like 'PRESSLEY', even if it exists but allow for manual SEARCH success", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] PRESSLEY 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] PRESSLEY 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "",
            enterSceneTitle: SwanOfSorrow.title,
            enterStudioName: SwanOfSorrow.studio,
          },
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Should grab an alias for an actor Madison Swan = Mia Malkova", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Madison Swan 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Madison Swan 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Should grab an alias with no spaces for an actor Madison Swan = Mia Malkova", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] MadisonSwan 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] MadisonSwan 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Search and Grab a scene with multiple parsed Actors, run a search and match based on title of scene - testing YY-MM-DD", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Sex Art] Lena Love, Venera 21.01.27 - Delicate Awakening.mp4",
        scenePath: "Z:\\Keep\\test\\[Sex Art] Lena Love, Venera 21.01.27 - Delicate Awakening.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Lena Love",
            enterSceneDate: "21.01.27",
            enterSceneTitle: "Delicate Awakening",
            enterStudioName: "SEX ART",
            manualActors: "Lena Love, Venera",
            manualDescription: "Gorgeous Venera is roused from sleep by Lena Love’s gentle touch",
            movieTitle: "",
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(
        'Gorgeous Venera is roused from sleep by Lena Love’s gentle touch, as Andrej Lupin’s hot lesbian movie "Delicate Awakening" \
begins. Playful chatter gives way to sweet kisses, the beautiful blondes undressing each other as they embrace. Lena lavishes \
attention on her girlfriend’s big breasts, licking and sucking her nipples sensuously, then crawls up to sit on her face. Venera \
licks her succulent pink folds, pausing for them both to get naked before Lena crouches between her splayed thighs and eats her \
shaved pussy voraciously. She adds her fingers to drive her sweetheart over the edge of a powerful orgasm. Lena giggles with \
excitement as Venera starts to stroke and lick her, flicking her rigid nipples with her tongue and strumming her clit skilfully. \
She eases two fingers into Lena’s slick pussy to bring her to an intense, quivering orgasm. They move into a sixty-nine with Venera \
on top, pleasuring each other in unison, both of them squirming and squealing in ecstasy.'
      );
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal("SEX ART");
      expect(result.labels).to.be.an("array");
      expect(result.labels).to.not.be.empty;
    });
    it("Search and Grab a Scene that has multiple parsed Studios - testing dd.mm.yyyy", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Bangbros clips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Bangbros clips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "04.01.2016",
            enterSceneTitle: "Flexible while getting pounded",
            enterStudioName: "Banbros clips",
            manualActors: "Mia Malkova",
            manualDescription:
              "stud lovin'. Cum watch Mia Malkova work this hard cock to explosion of warm man chowder all across her face!",
            movieTitle: "",
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(
        "Mia Malkova is one sexy all natural a babe. Sweet pair of tits, a tight pussy and a perfect round ass. She's fucking hot! Hands down! Mia shows off her cock sucking skills and then shows us how flexible she is. Ramon Nomar was fucking her good. Pounding that tight pussy good."
      );
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal("BANGBROS CLIPS");
    });
    it("Search and Grab a Scene that has multiple parsed Studios with no spaces - testing dd.mm.yyyy", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Bangbrosclips] Mia Malkova 04.01.2016 - Flexible while getting pounded.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "04.01.2016",
            enterSceneTitle: "Flexible while getting pounded",
            enterStudioName: "Bangbrosclips",
            manualActors: "Mia Malkova",
            manualDescription:
              "stud lovin'. Cum watch Mia Malkova work this hard cock to explosion of warm man chowder all across her face!",
            movieTitle: "",
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(
        "Mia Malkova is one sexy all natural a babe. Sweet pair of tits, a tight pussy and a perfect round ass. She's fucking hot! Hands down! Mia shows off her cock sucking skills and then shows us how flexible she is. Ramon Nomar was fucking her good. Pounding that tight pussy good."
      );
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal("BANGBROS CLIPS");
    });
    it("Select a scene from a list of returned searches", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "",
            enterSceneTitle: "Mia Malkova Teen Fidelity",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "Swan of Sorrow Part 4",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Select 'none of the above' of the last 2 options in a rawlist, it should make the user select a choice.  Should return nothing because we assume we select 'do nothing' when asked again", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "",
            enterSceneTitle: "Teen Fidelity Mia Malkova",
            enterStudioName: "TEEN FIDELITY",
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "== None of the above ==",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.deep.equal({});
    });
    it("list of returned searches, let the script find the title within the path name", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "",
            enterSceneTitle: "",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("TPD not available and should not return anything because Manualinfo is = n", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14.mp4",
        testMode: {
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "",
            enterSceneTitle: "Teen Fidelity Mia Malkova",
            enterStudioName: "TEEN FIDELITY",
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "3",
          },
          testSiteUnavailable: true,
          status: true,
        },
      });
      expect(result).to.deep.equal({});
    });
    it("TPD does not support that specific studio. Should return nothing because we assume we select 'do nothing' when asked again", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Colette] Mia Malkova",
        scenePath: "Z:\\Keep\\test\\[Colette] Mia Malkova.mp4",
        testMode: {
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: "",
            enterSceneTitle: "Colette Mia Malkova",
            enterStudioName: "Colette",
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "3",
          },
          testSiteUnavailable: true,
          status: true,
        },
      });
      expect(result).to.deep.equal({});
    });
    it("Should not parse the studio but success in searching it with fullname", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[nostudio] Kira Perez - Cock Is Her Duty.mp4",
        scenePath: "Z:\\Keep\\test\\[nostudio] Kira Perez - Cock Is Her Duty.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Kira Perez",
            enterSceneDate: "",
            enterSceneTitle: "Cock Is Her Duty",
            enterStudioName: "BANG BROS 18",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(
        "FRAG OUT! Today we have the beautiful Kira Perez playing video games in her spare time. But then, out of the corner of the room, Lil D steps in to check his step sister out. He hides in a corner and throws paper balls to annoy her. Kira's had it with Lil D always bothering her so she challenges him to a match. Loser has to do something they don't want to do. Of course Kira beats his ass and so Lil D has to eat her ass. He isn't feeling it but Kira on the other hand, she wants more than just a tongue up her ass. She tells Lil D to put his pants down because she has an appetite for some dick. The rest is history as Kira shows us again why she is the hottest gamer girl out there. Shit, I might subscribe if she starts streaming! Watch Kira ride Lil D until she can't take it anymore and that's when she goes turbo mode and tries out different positions. Kira does her best to stay away from the gulag for you so watch until the end, dammit!"
      );
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal("BANG BROS 18");
    });

    it("with db, alwaysUseSingleResult, extra search -- Should find with correct answers", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          alwaysUseSingleResult: true,
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "fake scene name",
        scenePath: "Z:\\Keep\\test\\fake scene name",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "",
            enterOneActorName: "",
            enterSceneDate: "",
            enterSceneTitle: "",
            enterStudioName: "",
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "",
            extra: "Mia Malkova TEEN FIDELITY 2018.02.14",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio.toUpperCase()).to.equal(SwanOfSorrow.studio);
    });
  });

  describe("When UnPopulated Databases exist...", () => {
    it("Should return nothing because no search is completed with no parsed Actor or Studio when manualTouch is false", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: false,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosUnPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.deep.equal({});
    });
    it("Should allow manual input, no movie, no search -- Unpopulated databases", async () => {
      const manualDescription =
        "stud lovin. Cum watch Mia Malkova work this hard cock to explosion of warm man chowder all across her face!";

      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: false,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosUnPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.MANUAL_ENTER,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: SwanOfSorrow.dateStr,
            enterSceneTitle: "Swan of Sorrow Part 4",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "Mia Malkova,James Deen",
            manualDescription,
            movieTitle: "",
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(manualDescription);
      expect(result.releaseDate).to.be.a("number");
      expect(result.actors).to.be.a("Array");
      expect(result.actors).to.contain("Mia Malkova");
      expect(result.actors).to.contain("James Deen");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Not the correct import information, saying 'no' should assume 'do nothing' on the second question", async () => {
      const manualDescription =
        "stud lovin. Cum watch Mia Malkova work this hard cock to explosion of warm man chowder all across her face!";

      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: false,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosUnPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "n",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.MANUAL_ENTER,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: SwanOfSorrow.dateStr,
            enterSceneTitle: "Swan of Sorrow Part 4",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "Mia Malkova, James Deen",
            manualDescription,
            movieTitle: "",
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.deep.equal({});
    });
    it("Should allow manual input, with movie, no search -- Unpopulated databases", async () => {
      const manualDescription =
        "stud lovin. Cum watch Mia Malkova work this hard cock to explosion of warm man chowder all across her face!";
      const movieTitle = "mock movie";

      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosUnPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.MANUAL_ENTER,
            enterMovie: "y",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: SwanOfSorrow.dateStr,
            enterSceneTitle: "Swan of Sorrow Part 4",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "Mia Malkova, James Deen",
            manualDescription,
            movieTitle,
            multipleChoice: "",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(manualDescription);
      expect(result.releaseDate).to.be.a("number");
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
      expect(result.movie).to.equal(movieTitle);
    });

    it("no db, alwaysUseSingleResult, extra search -- Should find with correct answers", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          alwaysUseSingleResult: true,
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "fake scene name",
        scenePath: "Z:\\Keep\\test\\fake scene name",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "",
            enterOneActorName: "",
            enterSceneDate: "",
            enterSceneTitle: "",
            enterStudioName: "",
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "",
            extra: "Mia Malkova TEEN FIDELITY 2018.02.14",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio.toUpperCase()).to.equal(SwanOfSorrow.studio);
    });
  });

  describe("When Mixed Databases exist...", () => {
    it("Should have DB files with Studio and Scene already -- No Actor -- manualTouch True -- Should find with correct answers", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: SwanOfSorrow.dateStr,
            enterSceneTitle: "Swan of Sorrow Part 4",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "0",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("should import without an image. and create an error", async () => {
      const result = await runPlugin({
        ...mockContext,
        $createImage: () => Promise.reject(new Error("test error")),
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "n",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: SwanOfSorrow.dateStr,
            enterSceneTitle: "Swan of Sorrow Part 4",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "0",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result).to.not.have.property("thumbnail"); // expect property to not exist when creation fails
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });

    it("Should have DB files with Scene already -- No Studio or Actor -- manualTouch True -- Should find with correct answers", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "y",
            enterOneActorName: "Mia Malkova",
            enterSceneDate: SwanOfSorrow.dateStr,
            enterSceneTitle: "Swan of Sorrow Part 4",
            enterStudioName: SwanOfSorrow.studio,
            manualActors: "Mia Malkova, James Deen",
            manualDescription:
              "stud lovin'. Cum watch Mia Malkova work this hard cock to explosion of warm man chowder all across her face!",
            movieTitle: "",
            multipleChoice: "0",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Should have DB files with Scene already but return nothing, no questions -- No Studio or Actor parsed", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: false,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosUnPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        testMode: {
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.NOTHING,
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.deep.equal({});
    });

    it("Should have DB files with Scene already -- No Studio or Actor -- manualTouch True, extra search -- Should find with correct answers", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsUnPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesUnPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        scenePath: "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          questionAnswers: {
            enterInfoSearch: manualTouchChoices.SEARCH,
            enterMovie: "",
            enterOneActorName: "",
            enterSceneDate: "",
            enterSceneTitle: "",
            enterStudioName: "",
            manualActors: "",
            manualDescription: "",
            movieTitle: "",
            multipleChoice: "",
            extra: "Mia Malkova TEEN FIDELITY 2018.02.14",
          },
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
  });

  describe("When piped data exist...", () => {
    it("Should use and match studio, date and actor(s) piped data (when they exist and are enabled through config)", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: false,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          usePipedInputInSearch: true,
          alwaysUseSingleResult: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        // File data that should be ignored
        sceneName:
          "[TrickyOldTeacher] Clary (Busty brunette babe serves her boyfriend and tutor at once) (2017-11-20) [HEVC 720p]",
        scenePath:
          "Z:\\Keep\\test\\[TrickyOldTeacher] Clary (Busty brunette babe serves her boyfriend and tutor at once) (2017-11-20) [HEVC 720p].mp4",
        // Piped data that should take precedence
        data: {
          actors: ["Abella Danger"],
          studio: "Blacked",
          releaseDate: new Date(2014, 9, 20).valueOf(),
        },
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.name).to.equal("Big Booty Girl Worships Big Black Cock");
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.actors).to.contain("Abella Danger");
      expect(result.studio).to.equal("Blacked");
    });
    it("Should use and match movie/actor(s) piped data (when they exist and are enabled through config)", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: false,
          sceneDuplicationCheck: true,
          parseActor: true,
          parseStudio: true,
          parseDate: true,
          usePipedInputInSearch: true,
          alwaysUseSingleResult: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        // File data that should be ignored
        sceneName:
          "[TrickyOldTeacher] Clary (Busty brunette babe serves her boyfriend and tutor at once) (2017-11-20) [HEVC 720p]",
        scenePath:
          "Z:\\Keep\\test\\[TrickyOldTeacher] Clary (Busty brunette babe serves her boyfriend and tutor at once) (2017-11-20) [HEVC 720p].mp4",
        // Piped data that should take precedence
        data: {
          actors: ["Mia Malkova"],
          studio: "TEEN FIDELITY",
          releaseDate: SwanOfSorrow.date,
          movie: "",
        },
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.actors).to.contain("Mia Malkova");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Should ignore piped data when they exist and are disabled through config", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: false,
          sceneDuplicationCheck: true,
          parseActor: false,
          parseStudio: false,
          parseDate: true,
          useTitleInSearch: true,
          alwaysUseSingleResult: true,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        // File data that should be used
        sceneName: "Valentina Nappi - Honey Im Home - 2018-03-23",
        scenePath: "Z:\\Keep\\test\\Valentina Nappi - Honey Im Home - 2018-03-23.mp4",
        // Piped data that should be ignored
        data: {
          actors: ["Mia Malkova"],
          studio: "NEW SENSATIONS",
          releaseDate: 1381356000000, // 2013.10.10
          movie: "So Young So Sexy P.O.V. #8",
        },
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description)
        .to.be.a("string")
        .and.satisfy((desc) =>
          desc.startsWith(
            "Alex Legend and Valentina Nappi are dressed in their evening best as they lock lips in the hallway."
          )
        );
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.actors).to.contain("Valentina Nappi");
      expect(result.actors).to.contain("Alex Legend");
      expect(result.studio).to.equal("NF Busty");
    });
  });

  describe("When initial data exist...", () => {
    it("Should match from initial data", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: { releaseDate: SwanOfSorrow.date },
        $getStudio: async () => {
          return { name: SwanOfSorrow.studio };
        },
        $getMovies: async () => [],
        $getActors: async () => [{ name: "Mia Malkova" }],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: false,
          parseStudio: false,
          parseDate: false,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "Swan of Sorrow Part 4",
        scenePath:
          "Z:\\Keep\\test\\[Teen Fidelity] Mia Malkova 2018.02.14 - Swan of Sorrow Part 4.mp4",
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.equal(SwanOfSorrow.description);
      expect(result.releaseDate).to.be.a("number");
      expect(result.thumbnail).to.equal(IMAGE_ID);
      expect(result.actors).to.be.a("Array");
      expect(result.studio).to.equal(SwanOfSorrow.studio);
    });
    it("Should not match without the initial data", async () => {
      const result = await runPlugin({
        ...mockContext,
        event: "sceneCreated",
        scene: {},
        $getStudio: async () => {},
        $getMovies: async () => [],
        $getActors: async () => [],
        args: {
          manualTouch: true,
          sceneDuplicationCheck: true,
          parseActor: false,
          parseStudio: false,
          parseDate: false,
          source_settings: {
            actors: "./plugins/PromisedScene/test/fixtures/actorsPopulated.db",
            scenes: "./plugins/PromisedScene/test/fixtures/scenesPopulated.db",
            studios: "./plugins/PromisedScene/test/fixtures/studiosPopulated.db",
          },
        },
        sceneName: "So Young So Sexy P.O.V. #8",
        scenePath:
          "Z:\\Keep\\test\\[New Sensations] Mia Malkova 2013.10.10 - So Young So Sexy P.O.V. #8.mp4",
        testMode: {
          correctImportInfo: "y",
          testSiteUnavailable: false,
          status: true,
        },
      });
      expect(result).to.be.an("object");
      expect(result.description).to.be.undefined;
      expect(result.releaseDate).to.be.undefined;
      expect(result.thumbnail).to.undefined;
      expect(result.actors).to.be.undefined;
      expect(result.studio).to.be.undefined;
    });
  });
});
