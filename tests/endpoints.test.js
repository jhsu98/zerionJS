require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const PAGE_ID = process.env.PAGE_ID;
const ENDPOINT_URL = process.env.ENDPOINT_URL;

describe("GET endpoints & endpoint/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getPageEndpoints(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getPageEndpoint(PROFILE_ID, PAGE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getPageEndpoints(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getPageEndpoint(PROFILE_ID, PAGE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD endpoints", () => {
    it("Version 8 by ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postPageEndpoints(
            PROFILE_ID,
            PAGE_ID,
            {
                name: `e${Math.floor(new Date().getTime())}`,
                url: ENDPOINT_URL,
                feed_format: 'json',
                feed_format_version: 10,
                content_type: 'header'
            }
        );
        expect(result.status_code).toEqual(201);

        const ENDPOINT_ID = result.response.id;
        expect(Number(ENDPOINT_ID)).toBeGreaterThan(1);
        
        result = await api.putPageEndpoint(
            PROFILE_ID,
            PAGE_ID,
            ENDPOINT_ID,
            {
                name: 'Bar'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPageEndpoint(PROFILE_ID, PAGE_ID, ENDPOINT_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.name).toEqual('Bar');

        result = await api.deletePageEndpoint(PROFILE_ID, PAGE_ID, ENDPOINT_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 by Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postPageEndpoints(
            PROFILE_ID,
            PAGE_ID,
            {
                name: `e${Math.floor(new Date().getTime())}`,
                url: ENDPOINT_URL,
                feed_format: 'json',
                feed_format_version: 10,
                content_type: 'header'
            }
        );
        expect(result.status_code).toEqual(201);

        const ENDPOINT_ID = result.response.id;
        expect(Number(ENDPOINT_ID)).toBeGreaterThan(1);
        
        // result = await api.putPageEndpoints(
        //     PROFILE_ID,
        //     PAGE_ID,
        //     {
        //         name: 'Bar'
        //     },
        //     {
        //         fields: `id(="${ENDPOINT_ID}")`
        //     }
        // );
        // expect(result.status_code).toEqual(200);

        result = await api.getPageEndpoints(PROFILE_ID, PAGE_ID, { fields: `id(="${ENDPOINT_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deletePageEndpoints(PROFILE_ID, PAGE_ID, { fields: `id(="${ENDPOINT_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});