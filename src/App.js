import React, { Component } from 'react';
import './App.css';
import Header from './components/header';
import Posts from './components/posts';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from "react-apollo";
import Pusher from 'pusher-js';

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
})

class App extends Component {
  constructor(){
    super();
    //pusher connection
    this.pusher = new Pusher("PUSHER_APP_KEY", {
      cluser: 'eu',
      encrypted: true
    });
  }
  render() {
    return ( 
      <ApolloProvider client={client}>
          <div className="App">
            <Header />
            <section className="App-main">
              {/* Pass the pusher obj anmd apollo to the posts component */}
              <Posts pusher={this.pusher} apollo_client={client}/>
            </section>
          </div>
        </ApolloProvider>
    );
  }
}

export default App;
