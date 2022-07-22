import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import verifyCollections from "./verifyCollections";

yargs(hideBin(process.argv))
  .command(
    "* [dataFile]",
    "Verify collection proxies in Polygonscan",
    (yargs) =>
      yargs.positional("dataFile", {
        describe: `
        Path of the JSON file containing previous verifications. 
        A new one will be created if it does not exist`,
        default: path.resolve(__dirname, "..", "data.json"),
      }),
    (argv) => {
      verifyCollections(!!argv.failed, argv.dataFile);
    }
  )
  .option("failed", {
    alias: "f",
    type: "boolean",
    describe: "Run only failed verifications",
  })
  .parse();
