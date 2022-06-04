require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const OPTIONLIST_ID = process.env.OPTIONLIST_ID;

describe("GET optionlists & optionlists/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.getOptionLists(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getOptionList(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getOptionLists(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getOptionList(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("COPY optionlists/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.copyOptionList(PROFILE_ID, OPTIONLIST_ID);
        expect(result.status_code).toEqual(201);

        result = await api.deleteOptionList(PROFILE_ID, result.response.id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.copyOptionList(PROFILE_ID, OPTIONLIST_ID);
        expect(result.status_code).toEqual(201);

        result = await api.deleteOptionList(PROFILE_ID, result.response.id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD optionlists", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postOptionLists(
            PROFILE_ID,
            {
                name: `ol${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(201);

        const OPTIONLIST_ID = result.response.id;
        expect(Number(OPTIONLIST_ID)).toBeGreaterThan(1);
        
        result = await api.putOptionList(
            PROFILE_ID,
            OPTIONLIST_ID,
            {
                'name': 'Bar'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getOptionList(PROFILE_ID, OPTIONLIST_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.name).toEqual('Bar');

        result = await api.deleteOptionList(PROFILE_ID, OPTIONLIST_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});