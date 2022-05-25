require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;

describe("GET profiles & profiles/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getProfiles();
        expect(result.status_code).toEqual(200);

        result = await api.getProfile(result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getProfiles();
        expect(result.status_code).toEqual(200);

        result = await api.getProfile(result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("POST profile & PUT profiles/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.postProfile({ name: `pr crud ${Math.floor(new Date().getTime())}`, email: 'test@test.com', max_user: 0, max_page: 0, is_active: true });
        expect(result.status_code).toEqual(201);

        const PROFILE_ID = result.response.id;
        result = await api.putProfile(PROFILE_ID, { name: `CAN BE DELETED ${Math.floor(new Date().getTime())}`, is_active: false });

        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postProfile({ name: `pr crud ${Math.floor(new Date().getTime())+3}`, email: 'test@test.com', max_user: 0, max_page: 0, is_active: true });
        expect(result.status_code).toEqual(201);

        const PROFILE_ID = result.response.id;

        result = await api.putProfile(PROFILE_ID, { name: `CAN BE DELETED ${Math.floor(new Date().getTime())+3}`, is_active: false });
        expect(result.status_code).toEqual(200);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("GET profiles/self", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getHomeProfile();
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getHomeProfile();
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("GET companyinfo", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getCompanyInfo(PROFILE_ID);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getCompanyInfo(PROFILE_ID);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("PUT companyinfo", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.putCompanyInfo(PROFILE_ID, { homemessage: `updated: ${new Date().toISOString()}` });
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.putCompanyInfo(PROFILE_ID, { homemessage: `updated: ${new Date().toISOString()}` });
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});