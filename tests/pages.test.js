require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const PROFILE_ID_2 = process.env.PROFILE_ID_2;
const PAGE_ID = process.env.PAGE_ID;
const PAGE_ID_2 = process.env.PAGE_ID_2;
const PAGEGROUP_ID = process.env.PAGEGROUP_ID;
const RECORD_ID = process.env.RECORD_ID;
const USER_ID = process.env.USER_ID;
const USER_ID_2 = process.env.USER_ID_2;
const LANGUAGE_CODE = 'es';
const ATTRIBUTE_NAME = 'map_priority';

describe("GET pages & pages/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.getPages(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getPage(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getPages(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getPage(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("GET pagegroups & pagegroups/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.getPageGroups(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getPageGroup(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getPageGroups(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getPageGroup(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("COPY page", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 6);
        await api.init();

        let result = await api.copyPage(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(201);

        if(result.response.id) {
            api.deletePage(PROFILE_ID, result.response.id);
        }
    }, 10000);

    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.copyPage(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(201);

        if(result.response.id) {
            api.deletePage(PROFILE_ID, result.response.id);
        }
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pages", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPages(
            PROFILE_ID,
            {
                label: 'Test Page',
                name: `p${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(201);

        const PAGE_ID = result.response.id;
        expect(Number(PAGE_ID)).toBeGreaterThan(1);
        
        result = await api.putPage(
            PROFILE_ID,
            PAGE_ID,
            {
                label: 'Bar'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPage(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.label).toEqual('Bar');

        result = await api.deletePage(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    // it("Version 8 with Fields", async () => {
    //     const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
    //     await api.init();

    //     let result = await api.postPages(
    //         PROFILE_ID,
    //         {
    //             label: 'Test Page',
    //             name: `p${Math.floor(new Date().getTime())}`
    //         }
    //     );
    //     expect(result.status_code).toEqual(201);

    //     const PAGE_ID = result.response.id;
    //     expect(Number(PAGE_ID)).toBeGreaterThan(1);
        
    //     result = await api.putPages(
    //         PROFILE_ID,
    //         {
    //             label: 'Bar'
    //         },
    //         { fields: `id(="${PAGE_ID}")` }
    //     );
    //     expect(result.response.length).toEqual(1);

    //     result = await api.getPages(PROFILE_ID, { fields: `id(="${PAGE_ID}")` });
    //     expect(result.response.length).toEqual(1);

    //     result = await api.deletePages(PROFILE_ID, { fields: `id(="${PAGE_ID}")` });
    //     expect(result.response.length).toEqual(1);
    // }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pagegroups", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageGroups(
            PROFILE_ID,
            {
                name: `pg${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(201);

        const PAGEGROUP_ID = result.response.id;
        expect(Number(PAGEGROUP_ID)).toBeGreaterThan(1);
        
        result = await api.putPageGroup(
            PROFILE_ID,
            PAGEGROUP_ID,
            {
                name: 'pg_foobar'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPageGroup(PROFILE_ID, PAGEGROUP_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.name).toEqual('pg_foobar');

        result = await api.deletePageGroup(PROFILE_ID, PAGEGROUP_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    // it("Version 8 with Fields", async () => {
    //     const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
    //     await api.init();

    //     let result = await api.postPageGroups(
    //         PROFILE_ID,
    //         {
    //             name: `pg${Math.floor(new Date().getTime())}`
    //         }
    //     );
    //     expect(result.status_code).toEqual(201);

    //     const PAGEGROUP_ID = result.response.id;
    //     expect(Number(PAGEGROUP_ID)).toBeGreaterThan(1);
        
    //     result = await api.putPageGroups(
    //         PROFILE_ID,
    //         {
    //             name: 'pg_foobar'
    //         },
    //         { fields: `id(="${PAGEGROUP_ID}")` }
    //     );
    //     expect(result.response.length).toEqual(1);

    //     result = await api.getPageGroups(PROFILE_ID, { fields: `id(="${PAGEGROUP_ID}")` });
    //     expect(result.response.length).toEqual(1);

    //     result = await api.deletePageGroups(PROFILE_ID, { fields: `id(="${PAGEGROUP_ID}")` });
    //     expect(result.response.length).toEqual(1);
    // }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("GET pagefeeds", () => {
    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getPageFeed(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("POST pagetriggerpost", () => {
    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageTriggerPost(PROFILE_ID, PAGE_ID, [{ id: RECORD_ID }]);
        expect(result.status_code).toEqual(202);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pageemailalerts", () => {
    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageEmailAlerts(PROFILE_ID, PAGE_ID_2, { email: 'test@test.com' });
        expect(result.status_code).toEqual(201);

        result = await api.getPageEmailAlerts(PROFILE_ID, PAGE_ID_2);
        expect(result.status_code).toEqual(200);

        result = await api.deletePageEmailAlerts(PROFILE_ID, PAGE_ID_2, {fields: 'email(="test@test.com")'})
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pagelocalizations", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageLocalizations(
            PROFILE_ID,
            PAGE_ID,
            {
                language_code: LANGUAGE_CODE,
                label: `La Pelota`
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.putPageLocalization(
            PROFILE_ID,
            PAGE_ID,
            LANGUAGE_CODE,
            {
                label: `La Biblioteca`
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPageLocalization(PROFILE_ID, PAGE_ID, LANGUAGE_CODE);
        expect(result.status_code).toEqual(200);
        expect(result.response.label).toEqual('La Biblioteca');

        result = await api.deletePageLocalization(PROFILE_ID, PAGE_ID, LANGUAGE_CODE);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageLocalizations(
            PROFILE_ID,
            PAGE_ID,
            {
                language_code: LANGUAGE_CODE,
                label: 'La Pelota'
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putPageLocalizations(
            PROFILE_ID,
            PAGE_ID,
            {
                label: 'La Biblioteca'
            },
            { fields: `language_code(="${LANGUAGE_CODE}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getPageLocalizations(PROFILE_ID, PAGE_ID, { fields: `language_code(="${LANGUAGE_CODE}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deletePageLocalizations(PROFILE_ID, PAGE_ID, { fields: `language_code(="${LANGUAGE_CODE}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pageuserassignments", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageUserAssignments(
            PROFILE_ID,
            PAGE_ID,
            {
                user_id: USER_ID_2,
                can_collect: true,
                can_view: true
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.putPageUserAssignment(
            PROFILE_ID,
            PAGE_ID,
            USER_ID_2,
            {
                can_collect: false,
                can_view: false
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPageUserAssignment(PROFILE_ID, PAGE_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);

        result = await api.deletePageUserAssignment(PROFILE_ID, PAGE_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageUserAssignments(
            PROFILE_ID,
            PAGE_ID,
            {
                user_id: USER_ID_2,
                can_collect: true,
                can_view: true
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putPageUserAssignments(
            PROFILE_ID,
            PAGE_ID,
            {
                can_collect: false,
                can_view: false
            },
            { fields: `user_id(="${USER_ID_2}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getPageUserAssignments(PROFILE_ID, PAGE_ID, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deletePageUserAssignments(PROFILE_ID, PAGE_ID, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("GET pagerecordassignments DELETE pagerecordassignments", () => {
    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getPageRecordAssignments(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.deletePageRecordAssignments(PROFILE_ID, PAGE_ID, { id: RECORD_ID });
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRD pagegrouppageassignments", () => {
    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.getPageGroupPageAssignments(PROFILE_ID, PAGEGROUP_ID);
        expect(result.status_code).toEqual(200);

        const PAGE_ID = result.response[0].page_id;

        result = await api.deletePageGroupPageAssignments(PROFILE_ID, PAGEGROUP_ID, { fields: `page_id(="${PAGE_ID}")` });
        expect(result.status_code).toEqual(200);

        result = await api.postPageGroupPageAssignments(PROFILE_ID, PAGEGROUP_ID, { page_id: PAGE_ID });
        expect(result.status_code).toEqual(201);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRD pagegroupuserassignments", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageGroupUserAssignments(PROFILE_ID, PAGEGROUP_ID, { user_id: USER_ID_2, can_collect: false, can_view: false });
        expect(result.status_code).toEqual(201);

        result = await api.putPageGroupUserAssignment(PROFILE_ID, PAGEGROUP_ID, USER_ID_2, { can_collect: true, can_view: true });
        expect(result.status_code).toEqual(200);

        result = await api.getPageGroupUserAssignment(PROFILE_ID, PAGEGROUP_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);

        result = await api.deletePageGroupUserAssignment(PROFILE_ID, PAGEGROUP_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageGroupUserAssignments(PROFILE_ID, PAGEGROUP_ID, { user_id: USER_ID_2, can_collect: false, can_view: false });
        expect(result.status_code).toEqual(201);

        result = await api.putPageGroupUserAssignments(PROFILE_ID, PAGEGROUP_ID, { can_collect: true, can_view: true }, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.status_code).toEqual(200);

        result = await api.getPageGroupUserAssignments(PROFILE_ID, PAGEGROUP_ID, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.status_code).toEqual(200);

        result = await api.deletePageGroupUserAssignments(PROFILE_ID, PAGEGROUP_ID, null, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.status_code).toEqual(200);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pageshares", () => {
    it("Version 8", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageShares(
            PROFILE_ID,
            PAGE_ID,
            {
                profile_id: PROFILE_ID_2,
                allow_copy: true
            }
        );
        expect(result.status_code).toEqual(201);

        const SHARE_ID = result.response.id;

        result = await api.putPageShares(
            PROFILE_ID,
            PAGE_ID,
            {
                allow_copy: false
            },
            { fields: `profile_id(="${PROFILE_ID_2}")` }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPageShares(PROFILE_ID, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.deletePageShares(PROFILE_ID, PAGE_ID, null, { fields: `profile_id(="${PROFILE_ID_2}")` });
        expect(result.status_code).toEqual(200);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD pagedynamicattributes", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageDynamicAttributes(
            PROFILE_ID,
            PAGE_ID,
            {
                attribute_name: ATTRIBUTE_NAME,
                value: 'modified_location'
            }
        );
        expect(result.status_code).toEqual(201);

        result = await api.putPageDynamicAttribute(
            PROFILE_ID,
            PAGE_ID,
            ATTRIBUTE_NAME,
            {
                value: 'created_location'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getPageDynamicAttribute(PROFILE_ID, PAGE_ID, ATTRIBUTE_NAME);
        expect(result.status_code).toEqual(200);

        result = await api.deletePageDynamicAttribute(PROFILE_ID, PAGE_ID, ATTRIBUTE_NAME);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, REGION, CLIENT_KEY, CLIENT_SECRET, 8);
        await api.init();

        let result = await api.postPageDynamicAttributes(
            PROFILE_ID,
            PAGE_ID,
            {
                attribute_name: ATTRIBUTE_NAME,
                value: 'modified_location'
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putPageDynamicAttributes(
            PROFILE_ID,
            PAGE_ID,
            {
                value: 'created_location'
            },
            { fields: `attribute_name(="${ATTRIBUTE_NAME}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getPageDynamicAttributes(PROFILE_ID, PAGE_ID, { fields: `attribute_name(="${ATTRIBUTE_NAME}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deletePageDynamicAttributes(PROFILE_ID, PAGE_ID, { fields: `attribute_name(="${ATTRIBUTE_NAME}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});