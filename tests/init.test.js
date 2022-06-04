require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const ZIM_CLIENT_KEY = process.env.ZIM_CLIENT_KEY;
const ZIM_CLIENT_SECRET = process.env.ZIM_CLIENT_SECRET;

describe("Unsuccessful new IFB()", () => {
    it("Missing Server", async () => {
        let isFailed = false;

        try {
            const api = new IFB(null, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(true);
    });

    it("Missing Client Key", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, null, CLIENT_SECRET, 8);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(true);
    });

    it("Missing Client Secret", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, null, 8);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(true);
    });

    it("Bad Version", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 7);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(true);
    });

    it("Bad Region", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, 'jp', CLIENT_KEY, CLIENT_SECRET, 6);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(true);
    });

    it("Skip Init", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
            let result = await api.getProfiles();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(true);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("Successful new IFB()", () => {
    it("Version 6", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(false);
    });

    it("Version 8", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(false);
    });

    it("ZIM Token", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, ZIM_CLIENT_KEY, ZIM_CLIENT_SECRET, 8);
            await api.init();
        } catch(err) {
            isFailed = true;
        }

        expect(isFailed).toEqual(false);
    });

    it("Version 8 Simple Response", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6, { simple_response: true });
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(false);
    });

    it("Version 8 Skip Rate Limit Retry", async () => {
        let isFailed = false;

        try {
            const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6, { skip_rate_limit_retry: true });
            await api.init();
        } catch (err) {
            isFailed = true;
        }
        expect(isFailed).toEqual(false);
    });
});

describe("Class Methods", () => {
    it("Public Methods", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        expect(api.getAccessToken()).not.toEqual(null);
        expect(api.getApiCount()).not.toEqual(null);
        expect(api.getStartTime()).not.toEqual(null);
        expect(api.getApiLifetime()).not.toEqual(null);
        expect(api.getAccessTokenExpiration()).not.toEqual(null);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});