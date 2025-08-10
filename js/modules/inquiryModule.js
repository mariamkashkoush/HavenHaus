// inquiries.js
import { getTable, add, setTable } from "./db.js";

export class Inquiry {

    constructor(userId, title, name, email, message) {
        this.userId = userId;
        this.title = title;
        this.name = name;
        this.email = email;
        this.message = message;
    
        
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        this.date = `${day}/${month}/${year}`;
    
        this.reply = ""; 
        this.id = this.#generateUniqueId(userId);
        this.summary = this.#generateSummary(message);
        this.details = {
            status: "Pending",
            statusClass: "bg-warning"
        };
    
    
    }

    
    #generateId(userId) {
        return `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    
    #generateUniqueId(userId) {
        let id;
        const existingIds = Inquiry.getAllInquiries().map(i => i.id);
        do {
            id = this.#generateId(userId);
        } while (existingIds.includes(id));
        return id;
    }
    #generateSummary(message) {
        
        return message.length > 60 ? `${message.substring(0, 60)}...` : message;
    }
    
    static getAllInquiries() {
        return getTable("inquiry") || [];
    }

    
    static addInquiry(inquiry) {
        add("inquiry", inquiry);
    }

    
    static getInquiriesByUser(userId) {
        return this.getAllInquiries().filter(i => i.userId == userId);
    }

    
    static replyToInquiry(data) {
        const inquiries = this.getAllInquiries();
        const index = inquiries.findIndex(i => i.id == data.id);

        if (index !== -1) {
            inquiries[index]= { ...inquiries[index], ...data }
            setTable("inquiry", inquiries);
        }
    }

    // Remove inquiry by ID (optional)
    static removeInquiry(inquiryId) {
        const updated = this.getAllInquiries().filter(i => i.id != inquiryId);
        setTable("inquiry", updated);
    }

    // Get single inquiry by ID
    static getInquiryById(id) {
        return this.getAllInquiries().find(i => i.id == id);
    }

    static updateinquiry(updatedInquiry){
        const inquiries = this.getAllInquiries();
        const index = inquiries.findIndex(i => i.id == updatedInquiry.id);
    
        if (index === -1) {
            throw new Error(`Product with ID ${updatedUser.id} not found.`);
        }
        
        const cleanUpdates = {};
        for (const [key, value] of Object.entries(updatedInquiry)) {
            if (value !== undefined && value !== null && key !== 'id') {
                cleanUpdates[key] = value;
            }
        }

        
        inquiries[index] = { ...inquiries[index], ...updatedInquiry };
    
        setTable("inquiry", inquiries);
    }

    static getInquiriesByStatus(status) {
        if (status.toLowerCase() === 'all') {
            return this.getAllInquiries();
        }
    
        return this.getAllInquiries().filter(i => i.details.status.toLowerCase() === status.toLowerCase());
    }
}
