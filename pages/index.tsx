// import { Router } from "../routes";
import Router from "next/router";
import React from "react";
import { seedGen } from "../libs/utils";

export default class extends React.Component {
  setChannel = () => {
    const channelID = seedGen(10);
    console.log("Starting channel with ID: ", channelID);
    setTimeout(() => {
      Router.push(`/channel/${channelID}`);
    }, 500);
  };

  render() {
    return (
      <div>
        <div>
          <button onClick={this.setChannel}>Go to a channel</button>
        </div>
      </div>
    );
  }
}
