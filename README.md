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

You can try to verify collections that failed any previous attempt by running `npm run start:failed`
