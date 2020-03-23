import { Link, Router } from "../routes";

import { isClient, seedGen } from "../libs/utils";

export default class extends React.Component {
  setChannel = (address, transactions, deposit) => {
    const channelID = seedGen(10);
    console.log("Starting channel with ID: ", channelID);
    setTimeout(() => {
      Router.pushRoute(`/channel/${channelID}`);
    }, 500);
  };

  render() {
    return (
      <div>
        {/* {console.log(this.state.form)} */}
        <div>
          {/* <Logo src={"/static/logo.svg"} /> */}
          <button onClick={this.setChannel}>Go to a channel</button>
        </div>
      </div>
    );
  }
}
