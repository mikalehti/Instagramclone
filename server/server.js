let express = require("express");
let graphqlHTTP = require("express-graphql");
let { buildSchema } = require("graphql");
let cors = require("cors");
let Pusher = require("pusher");
let bodyParser = require("body-parser");
let Multipart = require("connect-multiparty");

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
type User {
    id: String!
    nickname: String!
    avatar : String!
}
type Post {
    id: String!
    user: User!
    caption: String!
    image: String!
}
type Query {
    user(id: String) : User!
    post(user_id: String, post_id: String) : Post!
    posts(user_id: String) : [Post]
}
`);

// Maps id to User object
let userslist = {
    a: {
        id: "a",
        nickname: "Mikko",
        avatar: "../src/images/dummy.jpg"
    },
    b: {
        id: "b",
        nickname: "OG",
        avatar:
          "http://res.cloudinary.com/og-tech/image/upload/q_40/v1506850315/contact_tzltnn.jpg"
      }
};

let postslist = {
    a: {
        a: {
            id: "a",
            user: userslist["a"],
            caption: "Det är dags för japp!",
            image: "https://pbs.twimg.com/media/DOXI0IEXkAAkokm.jpg"
        },
        b: {
            id: "b",
            user: userslist["a"],
            caption: "Skitcaption för test okok=?????",
            image: "https://cdn-images-1.medium.com/max/1000/1*ltLfTw87lE-Dqt-BKNdj1A.jpeg"
        },
        c: {
            id: "c",
            user: userslist["a"],
            caption: "Låt oss bara fucking jappa asså",
            image: "https://pbs.twimg.com/media/DNNhrp6W0AAbk7Y.jpg:large"
        },
        d: {
            id: "d",
            user: userslist["a"],
            caption: "Legenden säger att man blir fast i grottan för alltid!",
            image: "https://pbs.twimg.com/media/DOXI0IEXkAAkokm.jpg"
        }
    }
};

let root = {
    user: function({ id }) {
        return userslist[id];
    },
    post: function ({ user_id, post_id }) {
        return postslist[user_id][post_id];
    },
    posts: function ({ user_id }) {
        return Object.values(postslist[user_id]);
    }
};

//COnfigure pusher 
let pusher = new Pusher({
    appId: 'PUSHER_APP_ID',
    key: 'PUSHER_APP_KEY',
    secret: 'PUSHER_APP_SECRET',
    cluster: 'PUSHER_CLUSTER',
    encrypted: true
  });

//MIDDLEWARE
let multipartMiddleware = new Multipart();


let app = express();
app.use(cors());
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    })
);

app.post('/newpost', multipartMiddleware, (req,res) => {
    //sample post
    let post = {
        user: {
            nickname: req.body.name,
            avatar: req.body.avatar
        },
        image: req.body.image,
        caption: req.body.caption
    }
    //trigger pusher event
    pusher.trigger("posts-channel", 'new-post', {
        post
    });
    return res.json({status : "Post Created"});
});


//set app port
app.listen(4000);