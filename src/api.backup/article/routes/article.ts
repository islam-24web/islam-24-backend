/**
 * article router — core CRUD (auto-generates find, findOne, create, update, delete)
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::article.article");
