/**
 * job router — core CRUD (find, findOne, create, update, delete)
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::job.job");
