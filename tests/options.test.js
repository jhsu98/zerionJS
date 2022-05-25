require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const OPTIONLIST_ID = process.env.OPTIONLIST_ID;
const OPTION_ID = process.env.OPTION_ID;
const LANGUAGE_CODE = 'es';

describe("GET options & option/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getOptions(PROFILE_ID, OPTIONLIST_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getOption(PROFILE_ID, OPTIONLIST_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getOptions(PROFILE_ID, OPTIONLIST_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getOption(PROFILE_ID, OPTIONLIST_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD options", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postOptions(
            PROFILE_ID,
            OPTIONLIST_ID,
            {
                label: 'Test Option',
                key_value: `o${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(201);

        const OPTION_ID = result.response.id;
        expect(Number(OPTION_ID)).toBeGreaterThan(1);

        result = await api.putOption(
            PROFILE_ID,
            OPTIONLIST_ID,
            OPTION_ID,
            {
                label: 'Bar'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getOption(PROFILE_ID, OPTIONLIST_ID, OPTION_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.label).toEqual('Bar');

        result = await api.deleteOption(PROFILE_ID, OPTIONLIST_ID, OPTION_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postOptions(
            PROFILE_ID,
            OPTIONLIST_ID,
            {
                label: 'Test Option',
                key_value: `o${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(201);

        const OPTION_ID = result.response.id;
        expect(Number(OPTION_ID)).toBeGreaterThan(1);

        result = await api.putOptions(
            PROFILE_ID,
            OPTIONLIST_ID,
            {
                label: 'Bar'
            },
            { fields: `id(="${OPTION_ID}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getOptions(PROFILE_ID, OPTIONLIST_ID, { fields: `id(="${OPTION_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteOptions(PROFILE_ID, OPTIONLIST_ID, { fields: `id(="${OPTION_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD optionlocalizations", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postOptionLocalizations(
            PROFILE_ID,
            OPTIONLIST_ID,
            OPTION_ID,
            {
                language_code: LANGUAGE_CODE,
                label: 'La Pelota'
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.putOptionLocalization(
            PROFILE_ID,
            OPTIONLIST_ID,
            OPTION_ID,
            LANGUAGE_CODE,
            {
                label: 'La Biblioteca'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getOptionLocalization(PROFILE_ID, OPTIONLIST_ID, OPTION_ID, LANGUAGE_CODE);
        expect(result.status_code).toEqual(200);

        result = await api.deleteOptionLocalization(PROFILE_ID, OPTIONLIST_ID, OPTION_ID, LANGUAGE_CODE);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postOptionLocalizations(
            PROFILE_ID,
            OPTIONLIST_ID,
            OPTION_ID,
            {
                language_code: LANGUAGE_CODE,
                label: 'La Pelota'
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.putOptionLocalizations(
            PROFILE_ID,
            OPTIONLIST_ID,
            OPTION_ID,
            {
                label: 'La Biblioteca'
            },
            { fields: `language_code(="${LANGUAGE_CODE}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getOptionLocalizations(PROFILE_ID, OPTIONLIST_ID, OPTION_ID, { fields: `language_code(="${LANGUAGE_CODE}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteOptionLocalizations(PROFILE_ID, OPTIONLIST_ID, OPTION_ID, { fields: `language_code(="${LANGUAGE_CODE}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});