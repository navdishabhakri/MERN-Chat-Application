const socketio= (io)=>{
    // socket connection
    const connectedUsers=new Map(); // map is dictionary of connected users
    // handle new socket connections
    io.on('connection',(socket)=>{ 
        // get user from authentication
        const user=socket.handshake.auth.user;
        console.log("user connected", user?.username);

        // start join room handler 
        // on is listen and emit is send
        socket.on('join room', (groupId)=>{ // join room is an even that is emitted from the client
            
            socket.join(groupId);
            connectedUsers.set(socket.id, {user,room:groupId});
            // get list of users in the room
            const usersInRoom= Array.from(connectedUsers.values()).filter((u)=> user.room===groupId).map((u)=>u.user);

            // emit the list of users in the room to all sockets in the room

            io.in(groupId).emit("users in room", usersInRoom); // emit to all sockets in the room
            socket.to(groupId).emit("notification", {
                type: "USER_JOINED",
                message: `${user?.username} has joined the room`,
                user: user,
            }
        )
    })

        //end

        // leave room handler
        socket.on('leave room', (groupId)=>{
            console.log(`${user?.username}leaving room:`,groupId);
            socket.leave(groupId); // remove socket
            if (connectedUsers.has(socket.id)){ // notify users
                connectedUsers.delete(socket.id); // remove user from connected users
                socket.to(groupId).emit("user left",user?._id) 
            }
            
        })
        //end


        // new message handler
        socket.on('new message', (message)=>{
            socket.to(message.groupId).emit("message received", message); // emit to all sockets in the room
        })
        // end

        // disconnect handler

        socket.on('disconnect',()=>{
            console.log(`${user?.username} disconnected`);
            if (connectedUsers.has(socket.id)){ // notify users
                const userData=connectedUsers.get(socket.id); // get user data
                socket.to(userData.room).emit("user left", user?._id) 
                connectedUsers.delete(socket.id); // remove user from connected users
            }
        })
        //end

        //typing indicator
        socket.on('typing', (groupId,username)=>{
            socket.to(groupId).emit("user typing", {username}); // emit to all sockets in the room
        })
        //end

        socket.on('stop typing', (groupId,username)=>{
            socket.to(groupId).emit("user stop typing", {username: user?.username}); // emit to all sockets in the room
        })
    })













}
module.exports= socketio;
