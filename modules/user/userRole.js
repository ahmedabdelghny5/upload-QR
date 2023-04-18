import { role } from "../../middleware/auth/auth.js";

export const endPoint={
    getAdmins:[role.Admin,role.User]
}