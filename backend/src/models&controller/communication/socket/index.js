const _group = require('../functions/group')

module.exports = (io) => {
    // io.on('connection', (socket) => {
    //     console.log('USER_ID', socket?.id);
    //     socket.on('join_room', (room) => {
    //         socket.join(room?.group_id)
    //     });
    //     socket.on('join_user', (user) => {

    //         socket.join(user?.user_id)

    //     });
    //     /*
    //         data = {

    //             group_id:string;
    //             message:string;
    //             sender_id:number
    //         }
    //     */
    //     socket.on('chat_group', (data) => {
    //         console.log('headers: chat_group', socket.handshake.headers)

    //         socket.to(data?.group_id).emit('receive_group_message', data)
    //     });
    //     socket.on('chat_private', (data) => {
    //         socket.to(data?.receiver_id).emit("receive_private_message", data)
    //     })
    // });

    io.on('connection', (socket) => {
        socket.on('join_user', (user) => {
            console.log('user: ', user);
            socket.join(String(user?.user_id));
        });
        socket.on('join_group', (group) => {
            console.log('group: ', group);
            socket.join(group?.group_ids?.map(String));
        });
        socket.on('create_group', async (group) => {
            let created_group = await _group.createGroup(group?.group);
            created_group?.members?.forEach(member => {
                socket.to(String(member?.toJSON()?.userId)).emit('group_created', created_group);

            });
        });
        socket.on("leave", (user) => {
            socket.leave(String(user?.user_id));
        })

    })

}