import {getTable,add,setTable } from "./db.js"
export class User{
    constructor({ firstName, lastName, email, role, phone, password }) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.password = password;
    
        this.id = this.#generateUniqueId(firstName,lastName);
    }

    #generateId(firstName , lastName) {
        return firstName + lastName + '_' + Math.random().toString(32).substring(2, 9);
    }

    #generateUniqueId(firstName , lastName){
        let id;
        const existingIds = User.getAllExistingUserIds();
        do{
            
            id = this.#generateId(firstName , lastName);
        }while(existingIds.includes(id));
        return id;
    }

    static getAllUsers(){
        return getTable("user")||[];
    }

    static getAllExistingUserIds() {
        const users = getTable("user") || [];
        return users.map(user => user.id);
    }

    static getAllExistingEmail(){
        const users = getTable("user")||[];
        return users.map(user => user.email.toLowerCase());
    }

    static getUserByEmail(email) {
        const users = getTable("user") || [];
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }
    
    static getCurrentUser(){
        return getTable('currentUser');
    }
    
    static getUserById(id){

        const users =this.getAllUsers()|| [];

        return users.find(user => user.id == id);
    }

    static checkUserExistance(email){
        const user = this.getUserByEmail(email);
        console.log(user);
        if(user)
            return true;
        return false;
    }

    static updateUser(updatedUser){
        const users = this.getAllUsers();
        const index = users.findIndex(user => user.id == updatedUser.id);
    
        if (index === -1) {
            throw new Error(`Product with ID ${updatedUser.id} not found.`);
        }
        
        const cleanUpdates = {};
        for (const [key, value] of Object.entries(updatedUser)) {
            if (value !== undefined && value !== null && key !== 'id') {
                cleanUpdates[key] = value;
            }
        }

        
        users[index] = { ...users[index], ...updatedUser };
    
        setTable("user", users);
        setTable("currentUser", updatedUser);
    }
    static addUser(user){
        add("user",user);
    }
    static getUserByRole(role){
        const users = this.getAllUsers();
        return users.filter(user => user.role == role);
    }


    static isEmailUsedByAnotherUser(email, userIdToExclude ) {
        return this.getAllUsers().some(user => user.email === email && user.id !== userIdToExclude);

    }


    static removeUser(id) {
            const users = this.getAllUsers().filter(user => user.id !== id);
            setTable("user", users);
    }
 
} 