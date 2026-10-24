import { randomBytes } from "node:crypto";

function normalizeEmail(email: unknown): string | undefined {
  if (typeof email !== "string") return undefined;
  return email.trim().toLowerCase();
}

export default {
  async beforeCreate(event: { params: { data: Record<string, unknown> } }) {
    const data = event.params.data;
    const normalized = normalizeEmail(data.email);
    if (normalized) data.email = normalized;
    if (!data.confirmationToken) {
      data.confirmationToken = randomBytes(32).toString("hex");
    }
  },

  async beforeUpdate(event: { params: { data: Record<string, unknown> } }) {
    const data = event.params.data;
    if (data.email !== undefined) {
      const normalized = normalizeEmail(data.email);
      if (normalized) data.email = normalized;
    }
  },
};
