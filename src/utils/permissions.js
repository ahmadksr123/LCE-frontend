export const canCreate = (role) => role === "Owner" || role === "Admin" || role === "User";
export const canEdit = (role) => role === "Owner" || role === "Admin";
export const canDelete = (role) => role === "Owner" || role === "Admin";
export const canManageUsers = (role) => role === "Owner" || role === "Admin";
