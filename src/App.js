import React, { Component } from "react";
import * as Auth0 from "auth0-web";
import PropTypes from "prop-types";
import { getCanvasPosition } from "./utils/formulas";
import Canvas from "./components/Canvas";
import io from "socket.io-client";


Auth0.configure({
  domain: "dieduro.auth0.com",
  clientID: "03j82lsHHwFEJLkm72NTmLZcOmBiO3bO",
  redirectUri: "http://localhost:3000/",
  responseType: "token id_token",
  scope: "openid profile manage:points",
  audience: "http://localhost:3001/"
});

class App extends Component {
  componentDidMount() {
    const self = this;
    Auth0.handleAuthCallback();

    Auth0.subscribe(auth => {
      if (!auth) return;

      const playerProfile = Auth0.getProfile();
      const currentPlayer = { id: playerProfile.sub, maxScore: 0, name: playerProfile.name, picture: playerProfile.picture };

      this.props.loggedIn(currentPlayer);

      const socket = io("http://localhost:3001", {
        query: `token=${Auth0.getAccessToken()}`
      });

      let emitted = false;
      socket.on("players", players => {
        this.props.leaderboardLoaded(players);

        if (emitted) return;
        socket.emit("new-max-score", {
          id: playerProfile.sub,
          maxScore: 120,
          name: playerProfile.name,
          picture: playerProfile.picture
        });
        emitted = true;
        setTimeout(() => {
          socket.emit("new-max-score", {
            id: playerProfile.sub,
            maxScore: 222,
            name: playerProfile.name,
            picture: playerProfile.picture
          });
        }, 5000);
      });
    });

    setInterval(() => {
      self.props.moveObjects(self.canvasMousePosition);
    }, 10);
    window.onresize = () => {
      const cnv = document.getElementById("aliens-go-home-canvas");
      cnv.style.width = `${window.innerWidth}px`;
      cnv.style.height = `${window.innerHeight}px`;
    };
    window.onresize();
  }

  trackMouse(event) {
    this.canvasMousePosition = getCanvasPosition(event);
  }

  render() {
    return (
      <Canvas
        angle={this.props.angle}
        currentPlayer={this.props.currentPlayer}
        gameState={this.props.gameState}
        players={this.props.players}
        startGame={this.props.startGame}
        trackMouse={event => (this.trackMouse(event))}
      />
    );
  }
}

App.propTypes = {
  angle: PropTypes.number.isRequired,
  gameState: PropTypes.shape({
    started: PropTypes.bool.isRequired,
    kills: PropTypes.number.isRequired,
    lives: PropTypes.number.isRequired,
    flyingObjects: PropTypes.arrayOf(
      PropTypes.shape({
        position: PropTypes.shape({
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired
        }).isRequired,
        id: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired,
  moveObjects: PropTypes.func.isRequired,
  startGame: PropTypes.func.isRequired
};

export default App;
