// Complete the server.js file to make user's add, delete and update the todos.
// No need to change pre-written code.
// Make necessary imports here.
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url'
import cors from 'cors';
import { connectToDatabase } from './db.config.js'
import Task from './task.schema.js'


// __dirname for ES6 modules
const __dirname = dirname(fileURLToPath(import.meta.url));


export const app = express();
app.use(cors());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

// Serve the html file
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'client.html'));
});

io.on("connection", (socket) => {
    console.log('New connection:', socket.id);

    // Get all tasks 
    Task.find().then((tasks) => {
        socket.emit('loadTasks', tasks);
    });

    // New Task Add
    socket.on('addTask', (taskText) => {
        // console.log(taskText)
        const newTask = new Task({ text: taskText });
        newTask.save().then((savedTask) => {
            io.emit('addTask', savedTask);
        });
    });

    // Deleting Task 
    socket.on('deleteTask', (taskId) => {
        // console.log("Task Delete id", taskId)
        Task.findByIdAndDelete(taskId).then(() => {
            io.emit('deleteTask', taskId);
        });
    });

    // Updating tasks
    socket.on('updateTask', ({ taskId, updatedText }) => {
        Task.findByIdAndUpdate(
            taskId,
            { text: updatedText },
            { new: true })
            .then((updatedTask) => {
                io.emit('updateTask', updatedTask);
            });
    });

    socket.on("disconnect", () => {
        console.log("Connection disconnected.");
    });
});


server.listen(3000, () => {
    console.log("Listening on port 3000");
    connectToDatabase();
});


