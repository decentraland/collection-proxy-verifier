# Collection Proxy Verifier

Verify decentraland collections as proxies without the hassle of doing it manually.

## Usage

Install dependencies with `npm ci`.

Copy the `.env.default` file into `.env` and fill the fields.

Run with `npm start`

## Notes

The application will attempt to verified collections from the oldest (created with the collection factory v3) to the newest.

The first time you run the application, a `./data.json` file will be created and filled with information about the verification attempts for each collection.

The second time you run the application, it will attempt to verify collections that have not been verified yet.

For example if we have collections A, B, C, D, E and we stopped the execution after C, the second execution will start at D.

You can try to verify collections that failed any previous attempt by running `npm run start:failed`.

Always commit the `data.json` file so anyone can continue the progress of the previous person.

## Last Run
02/02/2026

## 25/07/2022

~700 collections were verified directly by the PolygonScan team. This had to be done by them because API keys only have the capability of doing 100 per day.

The latest verified collection proxy was https://polygonscan.com/address/0xdcb5ed7f5a91ce07730e6141d533d950fa381c97 which was indexed with a `createdAt` of `1658747198`

The `.env.example` already has that value (+1 second so that collection is ignored) for CREATED_AT_GTE but make sure the copied `.env` has that same value too so older collections are not re-verified.
