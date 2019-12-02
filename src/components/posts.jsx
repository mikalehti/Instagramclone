import React, { Component } from "react";
import "../styles/Posts.css";
import gql from "graphql-tag";
import Post from "../components/post";

class Posts extends Component {
    constructor(){
        super();
        this.state = {
            posts : []
        };
    }

    componentDidMount(){
        //request permission
        Notification.requestPermission();
        //fetch initial posts
        this.props.apollo_client
        .query({
            query:gql`
            {
                posts(user_id: "a"){
                    id
                    user{
                        nickname
                        avatar
                    }
                    image
                    caption
                }
            }
        `
    })
        .then(response => {
            this.setState({ posts: response.data.posts});
        });
        //subscribe to posts channel
        this.posts_channel = this.props.pusher.subscribe('posts-channel');

        //listen for new post
        this.posts_channel.bind("new-post", data => {
            //update states
            this.setState({ posts: this.state.posts.concat(data.post) });

            //check if notifications are permitted
            if(Notification.permission === 'granted') {
                //notify user of new post
                try{
                let Notification = new Notification(
                    'Lehtidigitals Instagram Clone',
                    {
                        body: `New post from ${data.post.user.nickname}`,
                        icon: 'https://img.stackshare.io/service/115/Pusher_logo.png',
                        image: `${data.post.image}`,
                    }
                );
                //open website when notification is clicked
                Notification.onclick = function(event){
                    window.open('http://localhost:3000', '_blank');
                }
            }catch(e) {
                console.log('Error displaying notification');
                }
            }
        }, this);
    }
    //rendering the posts
    render(){
        return (
            <div className="Posts">
                 {this.state.posts
                 .slice(0)
                 .reverse()
                 .map(post => 
                 <Post 
                 nickname={post.user.nickname} 
                 avatar={post.user.avatar} 
                 image={post.image} 
                 caption={post.caption} 
                 key={post.id}/>)}
            </div>
        );
    }
}

export default Posts;