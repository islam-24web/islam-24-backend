/**
 * job-subscriber router — core CRUD (admin-only by default; not exposed to Public role)
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::job-subscriber.job-subscriber");
