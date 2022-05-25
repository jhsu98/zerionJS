require('dotenv').config();
const IFB = require("../zerionJS/ifb");

const SERVER = process.env.SERVER;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGION = process.env.REGION;
const PROFILE_ID = process.env.PROFILE_ID;
const USERGROUP_ID = process.env.USERGROUP_ID;
const USER_ID_2 = process.env.USER_ID_2;
const PAGE_ID_2 = process.env.PAGE_ID_2;
const USER_ID = process.env.USER_ID;
const PAGE_ID = process.env.PAGE_ID;
const RECORD_ID = process.env.RECORD_ID;

describe("GET users & users/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getUsers(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getUser(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getUsers(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getUser(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD users", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUsers(
            PROFILE_ID,
            {
                username: `u${Math.floor(new Date().getTime())}`,
                password: 'Abc123!@',
                email: 'test@test.com'
            }
        );
        expect(result.status_code).toEqual(201);

        const USER_ID = result.response.id;
        expect(Number(USER_ID)).toBeGreaterThan(1);
        
        result = await api.putUser(
            PROFILE_ID,
            USER_ID,
            {
                'first_name': 'Cloud',
                'last_name': 'Strife'
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getUser(PROFILE_ID, USER_ID);
        expect(result.status_code).toEqual(200);
        expect(result.response.first_name).toEqual('Cloud');
        expect(result.response.last_name).toEqual('Strife');

        result = await api.deleteUser(PROFILE_ID, USER_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUsers(
            PROFILE_ID,
            {
                username: `u${Math.floor(new Date().getTime())}`,
                password: 'Abc123!@',
                email: 'test@test.com'
            }
        );
        expect(result.status_code).toEqual(201);

        const USER_ID = result.response.id;
        expect(Number(USER_ID)).toBeGreaterThan(1);
        
        result = await api.putUsers(
            PROFILE_ID,
            {
                'first_name': 'Cloud',
                'last_name': 'Strife'
            },
            { fields: `id(="${USER_ID}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getUsers(PROFILE_ID, { fields: `id(="${USER_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteUsers(PROFILE_ID, { fields: `id(="${USER_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD userpageassignments", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserPageAssignments(
            PROFILE_ID,
            USER_ID_2,
            {
                page_id: PAGE_ID_2,
                can_collect: true,
                can_view: true
            }
        );
        expect(result.status_code).toEqual(201);

        const PAGE_ID = result.response.page_id;
        expect(Number(PAGE_ID)).toBeGreaterThan(1);
        
        result = await api.putUserPageAssignment(
            PROFILE_ID,
            USER_ID_2,
            PAGE_ID,
            {
                can_collect: false,
                can_view: false
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getUserPageAssignment(PROFILE_ID, USER_ID_2, PAGE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.deleteUserPageAssignment(PROFILE_ID, USER_ID_2, PAGE_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserPageAssignments(
            PROFILE_ID,
            USER_ID_2,
            {
                page_id: PAGE_ID_2,
                can_collect: true,
                can_view: true
            }
        );
        expect(result.status_code).toEqual(201);

        const PAGE_ID = result.response.page_id;
        expect(Number(PAGE_ID)).toBeGreaterThan(1);
        
        result = await api.putUserPageAssignments(
            PROFILE_ID,
            USER_ID_2,
            {
                can_collect: false,
                can_view: false
            },
            { fields: `page_id(="${PAGE_ID}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getUserPageAssignments(PROFILE_ID, USER_ID_2, { fields: `page_id(="${PAGE_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteUserPageAssignments(PROFILE_ID, USER_ID_2, { fields: `page_id(="${PAGE_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD userrecordassignments", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserRecordAssignments(
            PROFILE_ID,
            USER_ID,
            {
                page_id: PAGE_ID,
                record_id: RECORD_ID
            }
        );
        expect(result.status_code).toEqual(201);

        const ASSIGNMENT_ID = result.response.id;
        expect(Number(PAGE_ID)).toBeGreaterThan(1);
        
        result = await api.getUserRecordAssignment(PROFILE_ID, USER_ID, ASSIGNMENT_ID);
        expect(result.status_code).toEqual(200);

        result = await api.deleteUserRecordAssignment(PROFILE_ID, USER_ID, ASSIGNMENT_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserRecordAssignments(
            PROFILE_ID,
            USER_ID,
            {
                page_id: PAGE_ID,
                record_id: RECORD_ID
            }
        );
        expect(result.status_code).toEqual(201);

        const ASSIGNMENT_ID = result.response.id;
        expect(Number(PAGE_ID)).toBeGreaterThan(1);

        result = await api.getUserRecordAssignments(PROFILE_ID, USER_ID, { fields: `id(="${ASSIGNMENT_ID}")` });
        expect(result.response.length).toEqual(1);

        result = await api.deleteUserRecordAssignments(PROFILE_ID, USER_ID, { fields: `id(="${ASSIGNMENT_ID}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("GET usergroups & usergroups/:id", () => {
    it("Version 6", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 6, REGION);
        await api.init();

        let result = await api.getUserGroups(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getUserGroup(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    it("Version 8", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.getUserGroups(PROFILE_ID);
        expect(result.status_code).toEqual(200);

        result = await api.getUserGroup(PROFILE_ID, result.response[0].id);
        expect(result.status_code).toEqual(200);
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD usergroups", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserGroups(
            PROFILE_ID,
            {
                name: `ug${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(201);

        const USERGROUP_ID = result.response.id;
        expect(Number(USERGROUP_ID)).toBeGreaterThan(1);
        
        result = await api.putUserGroup(
            PROFILE_ID,
            USERGROUP_ID,
            {
                name: `foobar_group_${Math.floor(new Date().getTime())}`
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getUserGroup(PROFILE_ID, USERGROUP_ID);
        expect(result.status_code).toEqual(200);

        result = await api.deleteUserGroup(PROFILE_ID, USERGROUP_ID);
        expect(result.status_code).toEqual(200);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD usergroups/users", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserGroupUserAssignments(
            PROFILE_ID,
            USERGROUP_ID,
            {
                user_id: USER_ID_2
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.getUserGroupUserAssignment(PROFILE_ID, USERGROUP_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);


        result = await api.deleteUserGroupUserAssignment(PROFILE_ID, USERGROUP_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);

        result = await api.deleteUserGroupUserAssignments(PROFILE_ID, USERGROUP_ID, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserGroupUserAssignments(
            PROFILE_ID,
            USERGROUP_ID,
            {
                user_id: USER_ID_2
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.getUserGroupUserAssignments(PROFILE_ID, USERGROUP_ID, { fields: `user_id(="${USER_ID_2}")` });
        expect(result.response.length).toEqual(1);


        result = await api.deleteUserGroupUserAssignment(PROFILE_ID, USERGROUP_ID, USER_ID_2);
        expect(result.status_code).toEqual(200);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});

describe("CRUD usergroups/pages", () => {
    it("Version 8 with ID", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserGroupPageAssignments(
            PROFILE_ID,
            USERGROUP_ID,
            {
                page_id: PAGE_ID_2,
                can_collect: true,
                can_view: false
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putUserGroupPageAssignment(
            PROFILE_ID,
            USERGROUP_ID,
            PAGE_ID_2,
            {
                can_collect: true,
                can_view: true
            }
        );
        expect(result.status_code).toEqual(200);

        result = await api.getUserGroupPageAssignment(PROFILE_ID, USERGROUP_ID, PAGE_ID_2);
        expect(result.status_code).toEqual(200);
        expect(result.response.can_collect).toEqual(true);
        expect(result.response.can_view).toEqual(true);
        
        result = await api.deleteUserGroupPageAssignment(PROFILE_ID, USERGROUP_ID, PAGE_ID_2);
        expect(result.status_code).toEqual(200);
    }, 10000);

    it("Version 8 with Fields", async () => {
        const api = new IFB(SERVER, CLIENT_KEY, CLIENT_SECRET, 8, REGION);
        await api.init();

        let result = await api.postUserGroupPageAssignments(
            PROFILE_ID,
            USERGROUP_ID,
            {
                page_id: PAGE_ID_2,
                can_collect: true,
                can_view: false
            }
        );
        expect(result.status_code).toEqual(201);
        
        result = await api.putUserGroupPageAssignments(
            PROFILE_ID,
            USERGROUP_ID,
            {
                can_collect: true,
                can_view: true
            },
            { fields: `page_id(="${PAGE_ID_2}")` }
        );
        expect(result.response.length).toEqual(1);

        result = await api.getUserGroupPageAssignments(PROFILE_ID, USERGROUP_ID, { fields: `page_id(="${PAGE_ID_2}")` });
        expect(result.response.length).toEqual(1);
        
        result = await api.deleteUserGroupPageAssignments(PROFILE_ID, USERGROUP_ID, { fields: `page_id(="${PAGE_ID_2}")` });
        expect(result.response.length).toEqual(1);
    }, 10000);

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
});