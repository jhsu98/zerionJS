require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const PAGE_ID = process.env.PAGE_ID;
const ELEMENT_ID = process.env.ELEMENT_ID;
const ELEMENT_ID_2 = process.env.ELEMENT_ID_2;
const LANGUAGE_CODE = 'es';
const ATTRIBUTE_NAME = '12_24_hour_time';

describe("GET elements & elements/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getElements(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getElement(PROFILE_ID, PAGE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getElements(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getElement(PROFILE_ID, PAGE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("COPY element", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.copyElement(PROFILE_ID, PAGE_ID, ELEMENT_ID);
        expect(result.status_code).toEqual(201);

        result = await api.deleteElement(PROFILE_ID, PAGE_ID, result.response.id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.copyElement(PROFILE_ID, PAGE_ID, ELEMENT_ID);
        expect(result.status_code).toEqual(201);

        result = await api.deleteElement(PROFILE_ID, PAGE_ID, result.response.id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD elements", () => {
    it("Version 8 by ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postElements(
            PROFILE_ID,
            PAGE_ID,
            {
                label: 'Test Element',
                name: `e${Math.floor(new Date().getTime())}`,
                data_type: 1
            }
        );
        expect(result.status_code).toEqual(201);

        const ELEMENT_ID = result.response.id;
        expect(Number(ELEMENT_ID)).toBeGreaterThan(1);
        
        result = await api.putElement(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID,
            {
                'label': 'Bar'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getElement(PROFILE_ID, PAGE_ID, ELEMENT_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.label).toEqual('Bar');

        result = await api.deleteElement(PROFILE_ID, PAGE_ID, ELEMENT_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 by Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postElements(
            PROFILE_ID,
            PAGE_ID,
            {
                label: 'Test Element',
                name: `e${Math.floor(new Date().getTime())}`,
                data_type: 1
            }
        );
        expect(result.status_code).toEqual(201);

        const ELEMENT_ID = result.response.id;
        expect(Number(ELEMENT_ID)).toBeGreaterThan(1);
        
        result = await api.putElements(
            PROFILE_ID,
            PAGE_ID,
            {
                'label': 'Bar'
            },
            {
                fields: `id(="${ELEMENT_ID}")`
            }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getElements(PROFILE_ID, PAGE_ID, { fields: `id(="${ELEMENT_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteElements(PROFILE_ID, PAGE_ID, { fields: `id(="${ELEMENT_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD elementlocalizations", () => {
    it("Version 8 by ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postElementLocalizations(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID,
            {
                language_code: LANGUAGE_CODE,
                label: 'La Pelota'
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putElementLocalization(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID,
            LANGUAGE_CODE,
            {
                'label': 'La Biblioteca'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getElementLocalization(PROFILE_ID, PAGE_ID, ELEMENT_ID, LANGUAGE_CODE);
        expect(result.status_code).toEqual(200);

        result = await api.deleteElementLocalization(PROFILE_ID, PAGE_ID, ELEMENT_ID, LANGUAGE_CODE);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 by Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postElementLocalizations(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID,
            {
                language_code: LANGUAGE_CODE,
                label: 'La Pelota'
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putElementLocalizations(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID,
            {
                label: 'La Biblioteca'
            },
            {
                fields: `language_code(="${LANGUAGE_CODE}")`
            }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getElementLocalizations(PROFILE_ID, PAGE_ID, ELEMENT_ID, { fields: `language_code(="${LANGUAGE_CODE}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteElementLocalizations(PROFILE_ID, PAGE_ID, ELEMENT_ID, { fields: `language_code(="${LANGUAGE_CODE}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD elementdynamicattributes", () => {
    it("Version 8 by ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postElementDynamicAttributes(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID_2,
            {
                attribute_name: ATTRIBUTE_NAME,
                value: '24hr'
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putElementDynamicAttribute(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID_2,
            ATTRIBUTE_NAME,
            {
                value: '24hr'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getElementDynamicAttribute(PROFILE_ID, PAGE_ID, ELEMENT_ID_2, ATTRIBUTE_NAME);
        expect(result.status_code).toEqual(200);

        result = await api.deleteElementDynamicAttribute(PROFILE_ID, PAGE_ID, ELEMENT_ID_2, ATTRIBUTE_NAME);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 by Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postElementDynamicAttributes(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID_2,
            {
                attribute_name: ATTRIBUTE_NAME,
                value: '24hr'
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putElementDynamicAttributes(
            PROFILE_ID,
            PAGE_ID,
            ELEMENT_ID_2,
            {
                value: '24hr'
            },
            {
                fields: `attribute_name(="${ATTRIBUTE_NAME}")`
            }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getElementDynamicAttributes(PROFILE_ID, PAGE_ID, ELEMENT_ID_2, { fields: `attribute_name(="${ATTRIBUTE_NAME}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteElementDynamicAttributes(PROFILE_ID, PAGE_ID, ELEMENT_ID_2, { fields: `attribute_name(="${ATTRIBUTE_NAME}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});