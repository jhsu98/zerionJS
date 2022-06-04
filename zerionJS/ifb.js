const jwt = require("jsonwebtoken");
const axios = require("axios");
const util = require("util");

class IFB {
    #server;
    #client_key;
    #client_secret;
    #version;
    #region;
    #isSimpleResponse;
    #isSkipRateLimitRetry;

    #isZIM;
    #host;
    #token_url;

    #isConnected = false;
    #access_token;
    #access_token_expiration;
    #start_time;
    #api_calls;
    #last_execution_time;

    #ALLOWED_VERSIONS = [6, 8, 8.1];
    #ALLOWED_REGIONS = ["us", "uk", "au", "hipaa", "qa"];

    #resources = {
        Profiles: "profiles",
        Profile: "profiles/%s",
        HomeProfile: "profiles/self",

        CompanyInfo: "profiles/%s/company_info",

        Users: "profiles/%s/users",
        User: "profiles/%s/users/%s",

        UserPageAssignments: "profiles/%s/users/%s/page_assignments",
        UserPageAssignment: "profiles/%s/users/%s/page_assignments/%s",

        UserRecordAssignments: "profiles/%s/users/%s/record_assignments",
        UserRecordAssignment: "profiles/%s/users/%s/record_assignments/%s",

        UserGroups: "profiles/%s/user_groups",
        UserGroup: "profiles/%s/user_groups/%s",

        UserGroupUserAssignments: "profiles/%s/user_groups/%s/users",
        UserGroupUserAssignment: "profiles/%s/user_groups/%s/users/%s",

        UserGroupPageAssignments: "profiles/%s/user_groups/%s/page_assignments",
        UserGroupPageAssignment: "profiles/%s/user_groups/%s/page_assignments/%s",

        Pages: "profiles/%s/pages",
        Page: "profiles/%s/pages/%s",

        PageFeed: "profiles/%s/pages/%s/feed",

        PageLocalizations: "profiles/%s/pages/%s/localizations",
        PageLocalization: "profiles/%s/pages/%s/localizations/%s",

        PageUserAssignments: "profiles/%s/pages/%s/assignments",
        PageUserAssignment: "profiles/%s/pages/%s/assignments/%s",

        PageRecordAssignments: "profiles/%s/pages/%s/record_assignments",
        PageRecordAssignment: "profiles/%s/pages/%s/record_assignments/%s",

        PageEndpoints: "profiles/%s/pages/%s/http_callbacks",
        PageEndpoint: "profiles/%s/pages/%s/http_callbacks/%s",

        PageEmailAlerts: "profiles/%s/pages/%s/email_alerts",

        PageTriggerPost: "profiles/%s/pages/%s/trigger_posts",

        PageShares: "profiles/%s/pages/%s/shared_page",

        PageDynamicAttributes: "profiles/%s/pages/%s/dynamic_attributes",
        PageDynamicAttribute: "profiles/%s/pages/%s/dynamic_attributes/%s",

        PageGroups: "profiles/%s/page_groups",
        PageGroup: "profiles/%s/page_groups/%s",

        PageGroupPageAssignments: "profiles/%s/page_groups/%s/pages",
        PageGroupPageAssignment: "profiles/%s/page_groups/%s/pages/%s",

        PageGroupUserAssignments: "profiles/%s/page_groups/%s/assignments",
        PageGroupUserAssignment: "profiles/%s/page_groups/%s/assignments/%s",

        Elements: "profiles/%s/pages/%s/elements",
        Element: "profiles/%s/pages/%s/elements/%s",

        ElementLocalizations: "profiles/%s/pages/%s/elements/%s/localizations",
        ElementLocalization: "profiles/%s/pages/%s/elements/%s/localizations/%s",

        ElementDynamicAttributes: "profiles/%s/pages/%s/elements/%s/dynamic_attributes",
        ElementDynamicAttribute: "profiles/%s/pages/%s/elements/%s/dynamic_attributes/%s",

        OptionLists: "profiles/%s/optionlists",
        OptionList: "profiles/%s/optionlists/%s",

        Options: "profiles/%s/optionlists/%s/options",
        Option: "profiles/%s/optionlists/%s/options/%s",

        OptionLocalizations: "profiles/%s/optionlists/%s/options/%s/localizations",
        OptionLocalization: "profiles/%s/optionlists/%s/options/%s/localizations/%s",

        Records: "profiles/%s/pages/%s/records",
        Record: "profiles/%s/pages/%s/records/%s",

        RecordAssignments: "profiles/%s/pages/%s/records/%s/assignments",
        RecordAssignment: "profiles/%s/pages/%s/records/%s/assignments/%s",

        Notifications: "profiles/%s/notifications",

        PrivateMedia: "profiles/%s/media",

        DeviceLicenses: "profiles/%s/licenses",
        DeviceLicense: "profiles/%s/licenses/%s",
    };

    constructor(server, region, client_key, client_secret, version, params = {}) {
        if (!server || !client_key || !client_secret) throw "Server, Client Key, Client Secret are required";

        if (!this.#ALLOWED_VERSIONS.includes(version)) throw "Invalid Version";

        if (!this.#ALLOWED_REGIONS.includes(region)) throw "Invalid Region";

        this.#server = server;
        this.#client_key = client_key;
        this.#client_secret = client_secret;
        this.#version = version;
        this.#region = region;
        this.#isSimpleResponse = params.simple_response || false;
        this.#isSkipRateLimitRetry = params.skip_rate_limit_retry || false;
        this.#isZIM = this.#client_key.includes(".");

        switch (this.#version >= 8) {
            case true:
                this.#host = `https://${this.#region == "us" ? "" : this.#region + "-"}api.iformbuilder.com/exzact/api/v${this.#version * 10}/${this.#server}`;
                this.#token_url = `https://${this.#region == "us" ? "" : this.#region + "-"}api.iformbuilder.com/exzact/api/v${this.#version * 10}/${this.#server}/oauth/token`;
                break;
            case false:
                this.#host = `https://${this.#server}.iformbuilder.com/exzact/api/v${this.#version * 10}`;
                this.#token_url = `https://${this.#server}.iformbuilder.com/exzact/api/oauth/token`;
                break;
        }

        // Overwrite the token_url if isZIM is true
        if (this.#isZIM) {
            this.#token_url = this.#region == "qa" ? "https://qa-identity.zerionsoftware.com/oauth2/token" : "https://identity.zerionsoftware.com/oauth2/token";
        }
    }

    async init() {
        await this.#requestAccessToken();
        if (this.#access_token) {
            this.#isConnected = true;
        }
    }

    async #parseFunctionName(s) {
        const parts = s.split(/([A-Z][^A-Z]*)/).filter((x) => x);
        return [parts[0], parts.slice(1).join("")];
    }

    async #requestAccessToken() {
        const jwt_payload = {
            iss: this.#client_key,
            aud: this.#token_url,
            iat: Math.floor(new Date().getTime() / 1000),
            exp: Math.floor(new Date().getTime() / 1000) + 300,
        };

        const token = jwt.sign(jwt_payload, this.#client_secret);

        let params;
        let config;
        if (this.#isZIM) {
            params = {
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: token,
            };

            config = {};
        } else {
            params = new URLSearchParams();
            params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
            params.append("assertion", token);

            config = { headers: { "Content-Type": "application/x-www-form-urlencoded" } };
        }

        const result = await axios.post(this.#token_url, params, config).then((response) => {
            this.#access_token = response.data.access_token;
            this.#start_time = new Date();
            this.#access_token_expiration = new Date().getTime() + 3300;
        });
    }

    async #request(functionName, ids = [], data = null, params = null) {
        if (!this.#isConnected) throw "Cannot make API calls without access token. Run `async init()` before making API calls.";
        if (new Date().getTime() > this.#access_token_expiration) await this.#requestAccessToken();

        const [method, resource] = await this.#parseFunctionName(functionName);

        const headers = { Authorization: `Bearer ${this.#access_token}` };
        const url = ids && ids.length ? `${this.#host}/${util.format.apply(util, [this.#resources[resource], ...ids])}` : `${this.#host}/${this.#resources[resource]}`;

        let result;
        do {
            result = await axios.request({
                url,
                method,
                data,
                headers,
                params,
            });

            this.#api_calls++;
            this.#last_execution_time = result.elapsed;

        } while (result.status == 429 && !this.#isSkipRateLimitRetry);

        const response = {
            headers: result.headers,
            status_code: result.status,
            response: result.data,
        };

        return (this.#isSimpleResponse) ? response.response : response;
    }

    get access_token() {
        return this.#access_token;
    }

    get last_execution_time() {
        return this.#last_execution_time;
    }

    async getAccessToken() {
        return this.#access_token;
    }

    async getApiCount() {
        return this.#api_calls;
    }

    async getLastExecutionTime() {
        return this.#last_execution_time;
    }

    async getStartTime() {
        return this.#start_time;
    }

    async getApiLifetime() {
        return Number((new Date().getTime() - this.#start_time).toFixed(2));
    }

    async getAccessTokenExpiration() {
        return this.#access_token_expiration;
    }

    /************************
     * Profiles
     ***********************/
    async getProfiles(params) {
        return await this.#request("getProfiles", null, null, params);
    }

    async getProfile(profile_id) {
        return await this.#request("getProfile", [profile_id], null, null);
    }

    async getHomeProfile() {
        return await this.#request("getHomeProfile", null, null, null);
    }

    async postProfile(body) {
        return await this.#request("postProfiles", null, body, null);
    }

    async putProfile(profile_id, body) {
        return await this.#request("putProfile", [profile_id], body, null);
    }

    /************************
     * CompanyInfo
     ***********************/
    async getCompanyInfo(profile_id) {
        return await this.#request("getCompanyInfo", [profile_id], null, null);
    }

    async putCompanyInfo(profile_id, body) {
        return await this.#request("putCompanyInfo", [profile_id], body, null);
    }

    /************************
     * Users
     ***********************/
    async getUsers(profile_id, params) {
        return await this.#request("getUsers", [profile_id], null, params);
    }

    async getUser(profile_id, user_id) {
        return await this.#request("getUser", [profile_id, user_id], null, null);
    }

    async postUsers(profile_id, body) {
        return await this.#request("postUsers", [profile_id], body, null);
    }

    async putUsers(profile_id, body, params) {
        return await this.#request("putUsers", [profile_id], body, params);
    }

    async putUser(profile_id, user_id, body) {
        return await this.#request("putUser", [profile_id, user_id], body, null);
    }

    async deleteUsers(profile_id, params) {
        return await this.#request("deleteUsers", [profile_id], null, params);
    }

    async deleteUser(profile_id, user_id) {
        return await this.#request("deleteUser", [profile_id, user_id], null, null);
    }

    /************************
     * UserPageAssignments
     ***********************/
    async getUserPageAssignments(profile_id, user_id, params) {
        return await this.#request("getUserPageAssignments", [profile_id, user_id], null, params);
    }

    async getUserPageAssignment(profile_id, user_id, page_id) {
        return await this.#request("getUserPageAssignment", [profile_id, user_id, page_id], null, null);
    }

    async postUserPageAssignments(profile_id, user_id, body) {
        return await this.#request("postUserPageAssignments", [profile_id, user_id], body, null);
    }

    async putUserPageAssignments(profile_id, user_id, body, params) {
        return await this.#request("putUserPageAssignments", [profile_id, user_id], body, params);
    }

    async putUserPageAssignment(profile_id, user_id, page_id, body) {
        return await this.#request("putUserPageAssignment", [profile_id, user_id, page_id], body, null);
    }

    async deleteUserPageAssignments(profile_id, user_id, params) {
        return await this.#request("deleteUserPageAssignments", [profile_id, user_id], null, params);
    }

    async deleteUserPageAssignment(profile_id, user_id, page_id) {
        return await this.#request("deleteUserPageAssignment", [profile_id, user_id, page_id], null, null);
    }

    /************************
     * UserRecordAssignments
     ***********************/
    async getUserRecordAssignments(profile_id, user_id, params) {
        return await this.#request("getUserRecordAssignments", [profile_id, user_id], null, params);
    }

    async getUserRecordAssignment(profile_id, user_id, record_id) {
        return await this.#request("getUserRecordAssignment", [profile_id, user_id, record_id], null, null);
    }

    async postUserRecordAssignments(profile_id, user_id, body) {
        return await this.#request("postUserRecordAssignments", [profile_id, user_id], body, null);
    }

    async deleteUserRecordAssignments(profile_id, user_id, params) {
        return await this.#request("deleteUserRecordAssignments", [profile_id, user_id], null, params);
    }

    async deleteUserRecordAssignment(profile_id, user_id, record_id) {
        return await this.#request("deleteUserRecordAssignment", [profile_id, user_id, record_id], null, null);
    }

    /************************
     * UserGroups
     ***********************/
    async getUserGroups(profile_id, params) {
        return await this.#request("getUserGroups", [profile_id], null, params);
    }

    async getUserGroup(profile_id, usergroup_id) {
        return await this.#request("getUserGroup", [profile_id, usergroup_id], null, null);
    }

    async postUserGroups(profile_id, body) {
        return await this.#request("postUserGroups", [profile_id], body, null);
    }

    async putUserGroup(profile_id, usergroup_id, body) {
        return await this.#request("putUserGroup", [profile_id, usergroup_id], body, null);
    }

    async deleteUserGroup(profile_id, usergroup_id) {
        return await this.#request("deleteUserGroup", [profile_id, usergroup_id], null, null);
    }

    /************************
     * UserGroupUserAssignments
     ***********************/
    async getUserGroupUserAssignments(profile_id, usergroup_id, params) {
        return await this.#request("getUserGroupUserAssignments", [profile_id, usergroup_id], null, params);
    }

    async getUserGroupUserAssignment(profile_id, usergroup_id, user_id) {
        return await this.#request("getUserGroupUserAssignment", [profile_id, usergroup_id, user_id], null, null);
    }

    async postUserGroupUserAssignments(profile_id, usergroup_id, body) {
        return await this.#request("postUserGroupUserAssignments", [profile_id, usergroup_id], body, null);
    }

    async deleteUserGroupUserAssignments(profile_id, usergroup_id, params) {
        return await this.#request("deleteUserGroupUserAssignments", [profile_id, usergroup_id], null, params);
    }

    async deleteUserGroupUserAssignment(profile_id, usergroup_id, user_id) {
        return await this.#request("deleteUserGroupUserAssignment", [profile_id, usergroup_id, user_id], null, null);
    }

    /************************
     * UserGroupPageAssignments
     ***********************/
    async getUserGroupPageAssignments(profile_id, usergroup_id, params) {
        return await this.#request("getUserGroupPageAssignments", [profile_id, usergroup_id], null, params);
    }

    async getUserGroupPageAssignment(profile_id, usergroup_id, page_id) {
        return await this.#request("getUserGroupPageAssignment", [profile_id, usergroup_id, page_id], null, null);
    }

    async postUserGroupPageAssignments(profile_id, usergroup_id, body) {
        return await this.#request("postUserGroupPageAssignments", [profile_id, usergroup_id], body, null);
    }

    async putUserGroupPageAssignments(profile_id, usergroup_id, body, params) {
        return await this.#request("putUserGroupPageAssignments", [profile_id, usergroup_id], body, params);
    }

    async putUserGroupPageAssignment(profile_id, usergroup_id, page_id, body) {
        return await this.#request("putUserGroupPageAssignment", [profile_id, usergroup_id, page_id], body, null);
    }

    async deleteUserGroupPageAssignments(profile_id, usergroup_id, params) {
        return await this.#request("deleteUserGroupPageAssignments", [profile_id, usergroup_id], null, params);
    }

    async deleteUserGroupPageAssignment(profile_id, usergroup_id, page_id) {
        return await this.#request("deleteUserGroupPageAssignment", [profile_id, usergroup_id, page_id], null, null);
    }

    /************************
     * Pages
     ***********************/
    async getPages(profile_id, params) {
        return await this.#request("getPages", [profile_id], null, params);
    }

    async getPage(profile_id, page_id) {
        return await this.#request("getPage", [profile_id, page_id], null, null);
    }

    async copyPage(profile_id, page_id) {
        return await this.#request("copyPage", [profile_id, page_id], null, null);
    }

    async postPages(profile_id, body) {
        return await this.#request("postPages", [profile_id], body, null);
    }

    async putPage(profile_id, page_id, body) {
        return await this.#request("putPage", [profile_id, page_id], body, null);
    }

    async deletePage(profile_id, page_id) {
        return await this.#request("deletePage", [profile_id, page_id], null, null);
    }

    /************************
     * PageFeed
     ***********************/
    async getPageFeed(profile_id, page_id, params) {
        return await this.#request("getPageFeed", [profile_id, page_id], null, params);
    }

    /************************
     * PageLocalizations
     ***********************/
    async getPageLocalizations(profile_id, page_id, params) {
        return await this.#request("getPageLocalizations", [profile_id, page_id], null, params);
    }

    async getPageLocalization(profile_id, page_id, language_code) {
        return await this.#request("getPageLocalization", [profile_id, page_id, language_code], null, null);
    }

    async postPageLocalizations(profile_id, page_id, body) {
        return await this.#request("postPageLocalizations", [profile_id, page_id], body, null);
    }

    async putPageLocalizations(profile_id, page_id, body, params) {
        return await this.#request("putPageLocalizations", [profile_id, page_id], body, params);
    }

    async putPageLocalization(profile_id, page_id, language_code, body) {
        return await this.#request("putPageLocalization", [profile_id, page_id, language_code], body, null);
    }

    async deletePageLocalizations(profile_id, page_id, params) {
        return await this.#request("deletePageLocalizations", [profile_id, page_id], null, params);
    }

    async deletePageLocalization(profile_id, page_id, language_code) {
        return await this.#request("deletePageLocalization", [profile_id, page_id, language_code], null, null);
    }

    /************************
     * PageUserAssignments
     ***********************/
    async getPageUserAssignments(profile_id, page_id, params) {
        return await this.#request("getPageUserAssignments", [profile_id, page_id], null, params);
    }

    async getPageUserAssignment(profile_id, page_id, user_id) {
        return await this.#request("getPageUserAssignment", [profile_id, page_id, user_id], null, null);
    }

    async postPageUserAssignments(profile_id, page_id, body) {
        return await this.#request("postPageUserAssignments", [profile_id, page_id], body, null);
    }

    async putPageUserAssignments(profile_id, page_id, body, params) {
        return await this.#request("putPageUserAssignments", [profile_id, page_id], body, params);
    }

    async putPageUserAssignment(profile_id, page_id, user_id, body) {
        return await this.#request("putPageUserAssignment", [profile_id, page_id, user_id], body, null);
    }

    async deletePageUserAssignments(profile_id, page_id, params) {
        return await this.#request("deletePageUserAssignments", [profile_id, page_id], null, params);
    }

    async deletePageUserAssignment(profile_id, page_id, user_id) {
        return await this.#request("deletePageUserAssignment", [profile_id, page_id, user_id], null, null);
    }

    /************************
     * PageRecordAssignments
     ***********************/
    async getPageRecordAssignments(profile_id, page_id) {
        return await this.#request("getPageRecordAssignments", [profile_id, page_id], null, null);
    }

    async deletePageRecordAssignments(profile_id, page_id, body) {
        return await this.#request("deletePageRecordAssignments", [profile_id, page_id], body, null);
    }

    /************************
     * PageEndpoints
     ***********************/
    async getPageEndpoints(profile_id, page_id, params) {
        return await this.#request("getPageEndpoints", [profile_id, page_id], null, params);
    }

    async getPageEndpoint(profile_id, page_id, endpoint_id) {
        return await this.#request("getPageEndpoint", [profile_id, page_id, endpoint_id], null, null);
    }

    async postPageEndpoints(profile_id, page_id, body) {
        return await this.#request("postPageEndpoints", [profile_id, page_id], body, null);
    }

    async putPageEndpoint(profile_id, page_id, endpoint_id, body) {
        return await this.#request("putPageEndpoint", [profile_id, page_id, endpoint_id], body, null);
    }

    async deletePageEndpoints(profile_id, page_id, params) {
        return await this.#request("deletePageEndpoints", [profile_id, page_id], null, params);
    }

    async deletePageEndpoint(profile_id, page_id, endpoint_id) {
        return await this.#request("deletePageEndpoint", [profile_id, page_id, endpoint_id], null, null);
    }

    /************************
     * PageEmailAlerts
     ***********************/
    async getPageEmailAlerts(profile_id, page_id, params) {
        return await this.#request("getPageEmailAlerts", [profile_id, page_id], null, params);
    }

    async postPageEmailAlerts(profile_id, page_id, body) {
        return await this.#request("postPageEmailAlerts", [profile_id, page_id], body, null);
    }

    async deletePageEmailAlerts(profile_id, page_id, params) {
        return await this.#request("deletePageEmailAlerts", [profile_id, page_id], null, params);
    }

    /************************
     * PageTriggerPost
     ***********************/

    async postPageTriggerPost(profile_id, page_id, body) {
        return await this.#request("postPageTriggerPost", [profile_id, page_id], body);
    }

    /************************
     * PageShares
     ***********************/
    async getPageShares(profile_id, page_id, params) {
        return await this.#request("getPageShares", [profile_id, page_id], null, params);
    }

    async postPageShares(profile_id, page_id, body) {
        return await this.#request("postPageShares", [profile_id, page_id], body, null);
    }

    async putPageShares(profile_id, page_id, body, params) {
        return await this.#request("putPageShares", [profile_id, page_id], body, params);
    }

    async deletePageShares(profile_id, page_id, body, params) {
        return await this.#request("deletePageShares", [profile_id, page_id], body, params);
    }

    /************************
     * PageDynamicAttributes
     ***********************/
    async getPageDynamicAttributes(profile_id, page_id, params) {
        return await this.#request("getPageDynamicAttributes", [profile_id, page_id], null, params);
    }

    async getPageDynamicAttribute(profile_id, page_id, attribute_name) {
        return await this.#request("getPageDynamicAttribute", [profile_id, page_id, attribute_name], null, null);
    }

    async postPageDynamicAttributes(profile_id, page_id, body) {
        return await this.#request("postPageDynamicAttributes", [profile_id, page_id], body, null);
    }

    async putPageDynamicAttributes(profile_id, page_id, body, params) {
        return await this.#request("putPageDynamicAttributes", [profile_id, page_id], body, params);
    }

    async putPageDynamicAttribute(profile_id, page_id, attribute_name, body) {
        return await this.#request("putPageDynamicAttribute", [profile_id, page_id, attribute_name], body, null);
    }

    async deletePageDynamicAttributes(profile_id, page_id, params) {
        return await this.#request("deletePageDynamicAttributes", [profile_id, page_id], null, params);
    }

    async deletePageDynamicAttribute(profile_id, page_id, attribute_name) {
        return await this.#request("deletePageDynamicAttribute", [profile_id, page_id, attribute_name], null, null);
    }

    /************************
     * PageGroups
     ***********************/
    async getPageGroups(profile_id, params) {
        return await this.#request("getPageGroups", [profile_id], null, params);
    }

    async getPageGroup(profile_id, pagegroup_id) {
        return await this.#request("getPageGroup", [profile_id, pagegroup_id], null, null);
    }

    async postPageGroups(profile_id, body) {
        return await this.#request("postPageGroups", [profile_id], body);
    }

    async putPageGroup(profile_id, pagegroup_id, body) {
        return await this.#request("putPageGroup", [profile_id, pagegroup_id], body, null);
    }

    async deletePageGroup(profile_id, pagegroup_id) {
        return await this.#request("deletePageGroup", [profile_id, pagegroup_id], null, null);
    }

    /************************
     * PageGroupPageAssignments
     ***********************/
    async getPageGroupPageAssignments(profile_id, pagegroup_id) {
        return await this.#request("getPageGroupPageAssignments", [profile_id, pagegroup_id], null, null);
    }

    async postPageGroupPageAssignments(profile_id, pagegroup_id, body) {
        return await this.#request("postPageGroupPageAssignments", [profile_id, pagegroup_id], body, null);
    }

    async deletePageGroupPageAssignments(profile_id, pagegroup_id, params) {
        return await this.#request("deletePageGroupPageAssignments", [profile_id, pagegroup_id], null, params);
    }

    /************************
     * PageGroupUserAssignments
     ***********************/
    async getPageGroupUserAssignments(profile_id, pagegroup_id, params) {
        return await this.#request("getPageGroupUserAssignments", [profile_id, pagegroup_id], null, params);
    }

    async getPageGroupUserAssignment(profile_id, pagegroup_id, user_id) {
        return await this.#request("getPageGroupUserAssignment", [profile_id, pagegroup_id, user_id], null, null);
    }

    async postPageGroupUserAssignments(profile_id, pagegroup_id, body) {
        return await this.#request("postPageGroupUserAssignments", [profile_id, pagegroup_id], body, null);
    }

    async putPageGroupUserAssignments(profile_id, pagegroup_id, body, params) {
        return await this.#request("putPageGroupUserAssignments", [profile_id, pagegroup_id], body, params);
    }

    async putPageGroupUserAssignment(profile_id, pagegroup_id, user_id, body) {
        return await this.#request("putPageGroupUserAssignment", [profile_id, pagegroup_id, user_id], body, null);
    }

    async deletePageGroupUserAssignments(profile_id, pagegroup_id, body, params) {
        return await this.#request("deletePageGroupUserAssignments", [profile_id, pagegroup_id], body, params);
    }

    async deletePageGroupUserAssignment(profile_id, pagegroup_id, user_id) {
        return await this.#request("deletePageGroupUserAssignment", [profile_id, pagegroup_id, user_id], null, null);
    }

    /************************
     * Elements
     ***********************/
    async getElements(profile_id, page_id, params) {
        return await this.#request("getElements", [profile_id, page_id], null, params);
    }

    async getElement(profile_id, page_id, element_id) {
        return await this.#request("getElement", [profile_id, page_id, element_id], null, null);
    }

    async copyElement(profile_id, page_id, element_id) {
        return await this.#request("copyElement", [profile_id, page_id, element_id], null, null);
    }

    async postElements(profile_id, page_id, body) {
        return await this.#request("postElements", [profile_id, page_id], body, null);
    }

    async putElements(profile_id, page_id, body, params) {
        return await this.#request("putElements", [profile_id, page_id], body, params);
    }

    async putElement(profile_id, page_id, element_id, body) {
        return await this.#request("putElement", [profile_id, page_id, element_id], body, null);
    }

    async deleteElements(profile_id, page_id, params) {
        return await this.#request("deleteElements", [profile_id, page_id], null, params);
    }

    async deleteElement(profile_id, page_id, element_id) {
        return await this.#request("deleteElement", [profile_id, page_id, element_id], null, null);
    }

    /************************
     * ElementLocalizations
     ***********************/
    async getElementLocalizations(profile_id, page_id, element_id, params) {
        return await this.#request("getElementLocalizations", [profile_id, page_id, element_id], null, params);
    }

    async getElementLocalization(profile_id, page_id, element_id, language_code) {
        return await this.#request("getElementLocalization", [profile_id, page_id, element_id, language_code], null, null);
    }

    async postElementLocalizations(profile_id, page_id, element_id, body) {
        return await this.#request("postElementLocalizations", [profile_id, page_id, element_id], body, null);
    }

    async putElementLocalizations(profile_id, page_id, element_id, body, params) {
        return await this.#request("putElementLocalizations", [profile_id, page_id, element_id], body, params);
    }

    async putElementLocalization(profile_id, page_id, element_id, language_code, body) {
        return await this.#request("putElementLocalization", [profile_id, page_id, element_id, language_code], body, null);
    }

    async deleteElementLocalizations(profile_id, page_id, element_id, params) {
        return await this.#request("deleteElementLocalizations", [profile_id, page_id, element_id], null, params);
    }

    async deleteElementLocalization(profile_id, page_id, element_id, language_code) {
        return await this.#request("deleteElementLocalization", [profile_id, page_id, element_id, language_code], null, null);
    }

    /************************
     * ElementDynamicAttributes
     ***********************/
    async getElementDynamicAttributes(profile_id, page_id, element_id, params) {
        return await this.#request("getElementDynamicAttributes", [profile_id, page_id, element_id], null, params);
    }

    async getElementDynamicAttribute(profile_id, page_id, element_id, attribute_name) {
        return await this.#request("getElementDynamicAttribute", [profile_id, page_id, element_id, attribute_name], null, null);
    }

    async postElementDynamicAttributes(profile_id, page_id, element_id, body) {
        return await this.#request("postElementDynamicAttributes", [profile_id, page_id, element_id], body, null);
    }

    async putElementDynamicAttributes(profile_id, page_id, element_id, body, params) {
        return await this.#request("putElementDynamicAttributes", [profile_id, page_id, element_id], body, params);
    }

    async putElementDynamicAttribute(profile_id, page_id, element_id, attribute_name, body) {
        return await this.#request("putElementDynamicAttribute", [profile_id, page_id, element_id, attribute_name], body, null);
    }

    async deleteElementDynamicAttributes(profile_id, page_id, element_id, params) {
        return await this.#request("deleteElementDynamicAttributes", [profile_id, page_id, element_id], null, params);
    }

    async deleteElementDynamicAttribute(profile_id, page_id, element_id, attribute_name) {
        return await this.#request("deleteElementDynamicAttribute", [profile_id, page_id, element_id, attribute_name], null, null);
    }

    /************************
     * OptionLists
     ***********************/
    async getOptionLists(profile_id, params) {
        return await this.#request("getOptionLists", [profile_id], null, params);
    }

    async getOptionList(profile_id, optionlist_id) {
        return await this.#request("getOptionList", [profile_id, optionlist_id], null, null);
    }

    async copyOptionList(profile_id, optionlist_id) {
        return await this.#request("copyOptionList", [profile_id, optionlist_id]);
    }

    async postOptionLists(profile_id, body) {
        return await this.#request("postOptionLists", [profile_id], body);
    }

    async putOptionList(profile_id, optionlist_id, body) {
        return await this.#request("putOptionList", [profile_id, optionlist_id], body, null);
    }

    async deleteOptionList(profile_id, optionlist_id) {
        return await this.#request("deleteOptionList", [profile_id, optionlist_id], null, null);
    }

    /************************
     * Options
     ***********************/
    async getOptions(profile_id, optionlist_id, params) {
        return await this.#request("getOptions", [profile_id, optionlist_id], null, params);
    }

    async getOption(profile_id, optionlist_id, option_id) {
        return await this.#request("getOption", [profile_id, optionlist_id, option_id], null, null);
    }

    async postOptions(profile_id, optionlist_id, body) {
        return await this.#request("postOptions", [profile_id, optionlist_id], body, null);
    }

    async putOptions(profile_id, optionlist_id, body, params) {
        return await this.#request("putOptions", [profile_id, optionlist_id], body, params);
    }

    async putOption(profile_id, optionlist_id, option_id, body) {
        return await this.#request("putOption", [profile_id, optionlist_id, option_id], body, null);
    }

    async deleteOptions(profile_id, optionlist_id, params) {
        return await this.#request("deleteOptions", [profile_id, optionlist_id], null, params);
    }

    async deleteOption(profile_id, optionlist_id, option_id) {
        return await this.#request("deleteOption", [profile_id, optionlist_id, option_id], null, null);
    }

    /************************
     * OptionLocalizations
     ***********************/
    async getOptionLocalizations(profile_id, optionlist_id, option_id, params) {
        return await this.#request("getOptionLocalizations", [profile_id, optionlist_id, option_id], null, params);
    }

    async getOptionLocalization(profile_id, optionlist_id, option_id, language_code) {
        return await this.#request("getOptionLocalization", [profile_id, optionlist_id, option_id, language_code], null, null);
    }

    async postOptionLocalizations(profile_id, optionlist_id, option_id, body) {
        return await this.#request("postOptionLocalizations", [profile_id, optionlist_id, option_id], body, null);
    }

    async putOptionLocalizations(profile_id, optionlist_id, option_id, body, params) {
        return await this.#request("putOptionLocalizations", [profile_id, optionlist_id, option_id], body, params);
    }

    async putOptionLocalization(profile_id, optionlist_id, option_id, language_code, body) {
        return await this.#request("putOptionLocalization", [profile_id, optionlist_id, option_id, language_code], body, null);
    }

    async deleteOptionLocalizations(profile_id, optionlist_id, option_id, params) {
        return await this.#request("deleteOptionLocalizations", [profile_id, optionlist_id, option_id], null, params);
    }

    async deleteOptionLocalization(profile_id, optionlist_id, option_id, language_code) {
        return await this.#request("deleteOptionLocalization", [profile_id, optionlist_id, option_id, language_code], null, null);
    }

    /************************
     * Records
     ***********************/
    async getRecords(profile_id, page_id, params) {
        return await this.#request("getRecords", [profile_id, page_id], null, params);
    }

    async getRecord(profile_id, page_id, record_id) {
        return await this.#request("getRecord", [profile_id, page_id, record_id], null, null);
    }

    async copyRecord(profile_id, page_id, record_id) {
        return await this.#request("copyRecord", [profile_id, page_id, record_id], null, null);
    }

    async postRecords(profile_id, page_id, body) {
        return await this.#request("postRecords", [profile_id, page_id], body, null);
    }

    async putRecords(profile_id, page_id, body, params) {
        return await this.#request("putRecords", [profile_id, page_id], body, params);
    }

    async putRecord(profile_id, page_id, record_id, body) {
        return await this.#request("putRecord", [profile_id, page_id, record_id], body, null);
    }

    async deleteRecords(profile_id, page_id, params) {
        return await this.#request("deleteRecords", [profile_id, page_id], null, params);
    }

    async deleteRecord(profile_id, page_id, record_id) {
        return await this.#request("deleteRecord", [profile_id, page_id, record_id], null, null);
    }

    /************************
     * RecordAssignments
     ***********************/
    async getRecordAssignments(profile_id, page_id, record_id, params) {
        return await this.#request("getRecordAssignments", [profile_id, page_id, record_id], null, params);
    }

    async getRecordAssignment(profile_id, page_id, record_id, user_id) {
        return await this.#request("getRecordAssignment", [profile_id, page_id, record_id, user_id], null, null);
    }

    async postRecordAssignments(profile_id, page_id, record_id, body) {
        return await this.#request("postRecordAssignments", [profile_id, page_id, record_id], body, null);
    }

    async deleteRecordAssignments(profile_id, page_id, record_id, params) {
        return await this.#request("deleteRecordAssignments", [profile_id, page_id, record_id], null, params);
    }

    async deleteRecordAssignment(profile_id, page_id, record_id, user_id) {
        return await this.#request("deleteRecordAssignment", [profile_id, page_id, record_id, user_id], null, null);
    }

    /************************
     * Notifications
     ***********************/
    async postNotifications(profile_id, body) {
        return await this.#request("postNotifications", [profile_id], body, null);
    }

    /************************
     * PrivateMedia
     ***********************/
    async getPrivateMedia(profile_id, media_url) {
        return await this.#request("getPrivateMedia", [profile_id], null, { URL: media_url });
    }

    /************************
     * DeviceLicenses
     ***********************/
    async getDeviceLicenses(profile_id, params) {
        return await this.#request("getDeviceLicenses", [profile_id], null, params);
    }

    async getDeviceLicense(profile_id, license_id) {
        return await this.#request("getDeviceLicense", [profile_id, license_id], null, null);
    }
}

module.exports = IFB;
