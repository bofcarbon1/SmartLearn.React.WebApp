import React, { Component } from "react";
import ReactDOM from 'react-dom';
import {
  Link,
  Redirect
} from "react-router-dom";
import HomeStyles from '../styles/homeStyles.scss';
import YouTube from 'react-youtube';

class Home extends Component {  

  _onReady(event) {
    // access to player in all event handlers via event.target
    // event.target.mute();
  }
  
  _onEnd(event) {
    event.target.playVideo();
  }

  render() {

    //const siteTitle = this.props.data.site.siteMetadata.title
    //const siteDescription = this.props.data.site.siteMetadata.description
  
    const videoOptions = {
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        controls: 0,
        rel: 0,
        showinfo: 0
      }
    };

    return (   
      <div >  
        <div className="video-background">
          <div className="video-foreground">
            <YouTube
              videoId="A9nBzSh2RUw"
              opts={videoOptions}
              className="video-iframe"
              onReady={this._onReady}
              onEnd={this._onEnd}
            />                       
          </div>             
        </div> 
        <article>
          <div className="row">
            <div className="col-md-4"  >
              <p>Learners sign up for courses and lessons.</p>
              <Link to={"/help/"}>Learn More</Link>
            </div>
            <div className="col-md-4"  >
              <p>Trainers create courses and lessons.</p>
              <Link to={"/help/"}>Learn More</Link>
            </div>
            <div className="col-md-4"  >
              <p>Managers create projects and tasks.</p>
              <Link to={"/help/"}>Learn More</Link>
            </div>
          </div>         
         </article>
                  
       </div>             
    );
  }
}

export default Home;