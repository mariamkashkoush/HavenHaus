// auth.js
import { User } from "./userModule.js";
import { setTable, deleteTable, getTable } from "./db.js";
import { redirect } from "../util.js";



export class Roles {
    static ADMIN = '0';
    static SELLER = '1';
    static CUSTOMER = '2';
    static GUEST = 'guest';

}

const accessControlList = [
    { path: '/login.html',              allowedRoles: [Roles.GUEST] },
    { path: '/register.html',           allowedRoles: [Roles.GUEST] },
    { path: '/pages/catalog.html',      allowedRoles: [Roles.GUEST, Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN] },
    { path: '/pages/category.html',      allowedRoles: [Roles.GUEST, Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN] },
    { path: '/pages/product.html',      allowedRoles: [Roles.GUEST, Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN] },
    { path: '/',                        allowedRoles: [Roles.GUEST, Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN] },
    { path: '/index.html',                        allowedRoles: [Roles.GUEST, Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN] },
    { path: '/pages/profile.html',      allowedRoles: [Roles.GUEST, Roles.CUSTOMER, Roles.SELLER] },
    { path: '/pages/cart.html',         allowedRoles: [Roles.CUSTOMER,Roles.GUEST] },
    { path: '/checkout.html',           allowedRoles: [Roles.CUSTOMER] },
    { path: '/pages/dashboard-seller.html',   allowedRoles: [Roles.SELLER] },
    { path: '/pages/admin.html',              allowedRoles: [Roles.ADMIN] },
    { path: '/editUser.html',           allowedRoles: [Roles.ADMIN] },
    { path: '/pages/support.html',      allowedRoles: [Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN,Roles.GUEST] },
    { path: 'default',                  allowedRoles: [Roles.CUSTOMER, Roles.SELLER, Roles.ADMIN] }
];

function isAuthorized(userRole, requestedPath) {
    const rule = accessControlList.find(item => item.path === requestedPath);
    console.log(rule)
    if (rule) {
        return rule.allowedRoles.includes(userRole);
    }

    const defaultRule = accessControlList.find(item => item.path == 'default');
    return defaultRule ? defaultRule.allowedRoles.includes(userRole) : false;
}

export function enforceAuthorization(userRole, requestedPath, redirectPath = '/login.html') {
    console.log(userRole)
    console.log(requestedPath)
    console.log(redirectPath)
    if (!isAuthorized(userRole, requestedPath)) {
        console.warn(`Unauthorized access attempt to ${requestedPath} by role: ${userRole}. Redirecting.`);
        redirect(redirectPath);
    } else {
        console.log(`Authorized access to ${requestedPath} by role: ${userRole}.`);
    }
}


export class Auth {

    static login(data) {
        const loginEmail = data.email.toLowerCase();
        const loginPassword = data.password;

        const user = User.getUserByEmail(loginEmail);
        console.log("from login")
        if (!user) {
            console.log("Login failed: Email not found.");
            return false;
        }

        // NOTE: In a real app, you should hash the password and compare hashes
        // This is just a placeholder check.
        if (user.password === loginPassword) {
            setTable("currentUser", user);
            setTable("loggedin", true);
            console.log("Login successful:", user.email);
            return true;
        } else {
            console.log("Login failed: Incorrect password.");
            return false;
        }
    }

    static register(data) {
        const user = new User(data);
        console.log(`Attempting registration: ${user.email}`);

        const exists = User.checkUserExistance(user.email);

        if (!exists) {
            User.addUser(user);
            console.log(`Registration successful: ${user.email}`);
            return true;
        } else {
            console.log(`Registration failed: User already exists.`);
            return false;
        }
    }

    static logout() {
        deleteTable("currentUser");
        deleteTable("loggedin");
        console.log("User logged out.");
        redirect("/");
    }

    static isLoggedIn() {
        const isLoggedInStatus = getTable("loggedin");
        const currentUser = User.getCurrentUser();
        return isLoggedInStatus === true && currentUser !== null && currentUser !== undefined;
    }

    static getCurrentUserRole() {
        const currentUser = User.getCurrentUser();
        if (currentUser && currentUser.role && Object.values(Roles).includes(currentUser.role)) {
            return currentUser.role;
        }
        return Roles.GUEST;
    }

    static enforcePageAuthorization(redirectPath = '/login.html') {
        const currentUserRole = Auth.getCurrentUserRole();
        const currentPath = window.location.pathname;
        console.log(currentPath);
        enforceAuthorization(currentUserRole, currentPath, redirectPath);
    }

    static canAccess(path) {
        const currentUserRole = Auth.getCurrentUserRole();
        return isAuthorized(currentUserRole, path);
    }
}
