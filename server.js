const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer")
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const transporter = nodemailer.createTransport({
    port : 587,
    host:"smtp.gmail.com",
    auth : {
        user : "abhiramimajith6b@gmail.com",
        pass : "ggtipmkbzextrjgt"
    },
    secure:true
})

app.post("/send-mail",(req,res)=>{
    const to = req.body.to
    const url = req.body.url
    const maildata = {
        from :  "abhiramimajith6b@gmail.com",
        to : to,
        subject : "Join the video chat",
        html : `<p>Hey there,</p><p>Come and join me on a video chat here- ${url}</p>`
    }
    transporter.sendMail(maildata,(error,info)=>{
        if(error){
            return console.log(error)
        }
        else{
            res.status(200).send({message:"Invitation sent",message_id :info.messageId})
        }
    })
})

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room",(roomId,userId,userName)=>{
        socket.join(roomId)
        io.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
        io.to(roomId).emit("createMessage", message);
    });
    })
});

server.listen(3030);