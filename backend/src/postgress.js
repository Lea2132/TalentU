import { pool } from "./config/db.js"

// con el comando "npm run db" en la terminal se pueden ver estas consultas

const getClient = async()=>{
    try {
        const result = await pool.query("SELECT * FROM users")
        console.table(result.rows)
        console.log("Lista de usuarios")
    } catch (error) {
        console.log(error)
        
    }
}

const getChats = async()=>{
    try {
        const result = await pool.query("SELECT * FROM chats")
        console.table(result.rows)
        console.log("Lista de chats")
    } catch (error) {
        console.log(error)
        
    }
}

const getChatsBot = async()=>{
    try {
        const result = await pool.query("SELECT * FROM chatsBot")
        console.table(result.rows)
        console.log("Lista de chats bots")
    } catch (error) {
        console.log(error)
        
    }
}

const getProducts = async()=>{
    try {
        const result = await pool.query("SELECT * FROM products")
        console.table(result.rows)
        console.log("Lista de productos")
    } catch (error) {
        console.log(error)
        
    }
}
getClient()
getProducts()
getChats()
getChatsBot()