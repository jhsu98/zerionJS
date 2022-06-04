require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const USER_ID = process.env.USER_ID;

describe("POST notifications", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.postNotifications(PROFILE_ID, {message: 'Hello World', users: [USER_ID]});
        expect(result.status_code).toEqual(201);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postNotifications(PROFILE_ID, {message: 'Hello World', users: [USER_ID]});
        expect(result.status_code).toEqual(201);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});