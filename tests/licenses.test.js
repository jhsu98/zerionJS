require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;

describe("GET licenses & licenses/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getDeviceLicenses(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        if(result.response.length > 0) {
            result = await api.getDeviceLicense(PROFILE_ID, result.response[0].id);
            expect(result.status_code).toEqual(200);
        }
        
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getDeviceLicenses(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        if(result.response.length > 0) {
            result = await api.getDeviceLicense(PROFILE_ID, result.response[0].id);
            expect(result.status_code).toEqual(200);
        }
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});