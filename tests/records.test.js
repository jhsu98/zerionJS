require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const PAGE_ID = process.env.PAGE_ID;
const USER_ID = process.env.USER_ID;
const RECORD_ID = process.env.RECORD_ID;

describe("GET records & records/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.getRecords(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getRecord(PROFILE_ID, PAGE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getRecords(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getRecord(PROFILE_ID, PAGE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("COPY records/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.copyRecord(PROFILE_ID, PAGE_ID, RECORD_ID);
        expect(result.status_code).toEqual(201);

        result = await api.deleteRecord(PROFILE_ID, PAGE_ID, result.response.id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.copyRecord(PROFILE_ID, PAGE_ID, RECORD_ID);
        expect(result.status_code).toEqual(201);

        result = await api.deleteRecord(PROFILE_ID, PAGE_ID, result.response.id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD records", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postRecords(
            PROFILE_ID,
            PAGE_ID,
            {
                fields: [
                    {
                        element_name: 'my_element_1',
                        value: `v${Math.floor(new Date().getTime())}`
                    }
                ]
            }
        );
        expect(result.status_code).toEqual(201);

        const RECORD_ID = result.response.id;
        expect(Number(RECORD_ID)).toBeGreaterThan(1);
        
        result = await api.putRecord(
            PROFILE_ID,
            PAGE_ID,
            RECORD_ID,
            {
                fields: [
                    {
                        element_name: 'my_element_1',
                        value: 'foobar'
                    }
                ]
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getRecord(PROFILE_ID, PAGE_ID, RECORD_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.my_element_1).toEqual('foobar');

        result = await api.deleteRecord(PROFILE_ID, PAGE_ID, RECORD_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postRecords(
            PROFILE_ID,
            PAGE_ID,
            {
                fields: [
                    {
                        element_name: 'my_element_1',
                        value: `v${Math.floor(new Date().getTime())}`
                    }
                ]
            }
        );
        expect(result.status_code).toEqual(201);

        const RECORD_ID = result.response.id;
        expect(Number(RECORD_ID)).toBeGreaterThan(1);
        
        result = await api.putRecords(
            PROFILE_ID,
            PAGE_ID,
            {
                fields: [
                    {
                        element_name: 'my_element_1',
                        value: 'foobar'
                    }
                ]
            },
            { fields: `id(="${RECORD_ID}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getRecords(PROFILE_ID, PAGE_ID, { fields: `id(="${RECORD_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteRecords(PROFILE_ID, PAGE_ID, { fields: `id(="${RECORD_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD recordassignments", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postRecordAssignments(
            PROFILE_ID,
            PAGE_ID,
            RECORD_ID,
            {
                user_id: USER_ID
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.getRecordAssignment(PROFILE_ID, PAGE_ID, RECORD_ID, USER_ID);
        expect(result.status_code).toEqual(200);

        result = await api.deleteRecordAssignment(PROFILE_ID, PAGE_ID, RECORD_ID, USER_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postRecordAssignments(
            PROFILE_ID,
            PAGE_ID,
            RECORD_ID,
            {
                user_id: USER_ID
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.getRecordAssignments(PROFILE_ID, PAGE_ID, RECORD_ID, { fields: `user_id(="${USER_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteRecordAssignments(PROFILE_ID, PAGE_ID, RECORD_ID, { fields: `user_id(="${USER_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});