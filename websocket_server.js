var Websocket = require('ws')
var wss = new Websocket.Server({
    port: 6060
});

let connections = [];
messagesList = [];
let id = 1;
function send (con, data) {
    try {
        con.send(JSON.stringify({...data}))
    } catch (e) {
        console.log(e)
    }
}

wss.on('connection', (ws) => {
    console.log('新建一个websocket连接')
    send(ws, {
        id: id,
        type: '1', //成功建立连接
        num: connections.length
    })

    ws.on('message',(text) => {
            if(!text) {
                return false
            }
            console.log(`接收到数据${text}`)
            let data = JSON.parse(text)
            if(data.type === '2') { //用户请求接入聊天室
                connections.push({
                    connect: ws,
                    id: id,
                    name: data.name,
                })
                connections.forEach((con) => {
                    send(con.connect, ({
                        id: id,
                        name: data.name,
                        type: '2',
                        num: connections.length
                    }))
                })
                id++;
            } else if(data.type === '3') { //用户发送了消息
                connections.forEach((con) => {
                    send(con.connect, {
                        id: data.id,
                        name: data.name,
                        message: data.message,
                        type: '3',
                        num: connections.length
                    })
                })
            } else if(data.type === '4') { //用户请求离开
                connections.forEach((con) => {
                    send(con.connect, ({
                        id: data.id,
                        name: data.name,
                        type: '4',
                        num: connections.length-1
                    }))
                })
                // connections.forEach((con, index) => {
                //     if(con.id === data.id) {
                //         connections.splice(index, 1)
                //     }
                // })
            } else {
                send(ws, ({
                    message: 'type参数错误'
                }))

            }
    })
    

    ws.on('error', (code, reason) => {
        console.log('连接异常')
        errobj = []
        connections.forEach((con, index) => {
            if (con.connect === ws) {
                errobj.push({name: con.name, id: con.id})
                connections.splice(index, 1)
            }
        })

        if(errobj.length > 0) {
            errobj.forEach(obj => {
                console.log(`用户:(${errobj.name})异常中断连接退出聊天室(id:${errobj.id})`)
                connections.forEach((con) => {
                    send(con.connect({
                        id: obj.id,
                        name: obj.name,
                        type: '4',
                        num: connections.length
                    }))
                })
            })
        }
    })

    ws.on('close', (code, reason) => {
        console.log('连接关闭')
        errobj = []
        connections.forEach((con, index) => {
            if (con.connect === ws) {
                errobj.push({name: con.name, id: con.id})
                connections.splice(index, 1)
            }
        })

        if(errobj.length > 0) {
            errobj.forEach(obj => {
                console.log(`用户:(${obj.name})退出聊天室(id:${obj.id})`)
                connections.forEach((con) => {
                    send(con.connect, ({
                        id: obj.id,
                        name: obj.name,
                        type: '4',
                        num: connections.length
                    }))
                })
            })
        }
    })
})

console.log('websocket服务创建成功')

