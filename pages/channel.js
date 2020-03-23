import { Link, Router } from "../routes";

import { isClient, seedGen } from "../libs/utils";

import Header from "../components/channel/Header";
import History from "../components/channel/History";

import RTC from "../libs/rtc";

export default class extends React.Component {
  static async getInitialProps({ query }) {
    return query;
  }

  state = {
    visible: 0,
    alert: false,
    alertText: "Test",
    connected: false,
    channel: "share",
    userID: undefined,
    peers: [],
    title: "Waiting for peers to connect...",
    history: [
      { msg: "Waiting for a peer...", type: "system", time: Date.now() }
    ],
    message: ""
  };

  componentDidMount() {
    if (this.props.id === undefined) {
      Router.pushRoute(`/`);
    }
    console.log("Channel ID: " + this.props.id);
    setTimeout(() => {
      this.setState({ visible: 1 });
    }, 300);
    this.initChannel();
  }

  initChannel = async () => {
    console.log("Init channel ID", this.props.id);
    var started = false;
    var peer = await RTC.initChannel(this.props.id);
    this.setState({
      userID: peer.id
    });
    var Events = RTC.getEvents();

    RTC.connectToPeers(this.props.id);

    Events.on("message", async message => {
      console.log(`Message: ${message.connection.peer}:`, message.data);

      if (message.data.cmd === "message") {
        this.updateHistory({
          msg: message.data.msg,
          type: "partner",
          sender: message.connection.peer,
          time: Date.now()
        });
      } else if (message.data.cmd === "error") {
        this.updateHistory({
          msg: `${message.data.error}`,
          type: "system",
          sender: message.connection.peer,
          time: Date.now()
        });
        this.setState({
          alert: true,
          alertText: message.data.error
        });
      }
    });
    Events.on("peerJoined", async message => {
      console.log(`Peer Joined:`, message.connection.peer);
      this.updateHistory({
        msg: "Peer Connected",
        type: "system",
        sender: message.connection.peer,
        time: Date.now()
      });
      this.setState({
        channel: "connected",
        peers: [...new Set([...this.state.peers, message.connection.peer])],
        title: "Channel established"
      });
    });
    Events.on("peerLeft", message => {
      console.log("Peer Left:", message.connection.peer);
      this.updateHistory({
        msg: "Peer Disconnected",
        type: "system",
        sender: message.connection.peer,
        time: Date.now()
      });
      this.setState({
        channel: "share",
        peers: this.state.peers.filter(item => item != message.connection.peer),
        title: "Waiting for peers to connect..."
      });
      RTC.connectToPeers(this.props.id);
    });
  };

  updateHistory = data => {
    var history = this.state.history;
    history.push(data);
    this.setState({ history });
  };

  sendMessage = e => {
    e.preventDefault();
    if (!this.state.message) return;
    this.updateHistory({
      msg: this.state.message,
      type: "me",
      sender: "me",
      time: Date.now()
    });
    RTC.broadcastMessage({ cmd: "message", msg: this.state.message });
    console.log("Sending message", this.state.message);
    this.setState({ message: "" });
  };

  render() {
    return (
      <div>
        <div>
          <div>
            <h2 style={{ zIndex: 300 }}>
              {this.state.alertText && this.state.alertText}
            </h2>
            <button
              onClick={() => this.setState({ alert: false })}
            >{`   Clear Notification  `}</button>
          </div>
        </div>
        <div>
          <div>
            <div>
              <Header
                title={this.state.title}
                connected={this.state.peers.length > 0}
              />
              <p>Your ID: {this.state.userID}</p>
              <p>Connected peers: {this.state.peers.length}</p>
              <br />
              <p>Share this room link with your partner:</p>
              <p>{isClient ? window.location.href : null}</p>
            </div>
            {/* )} */}
          </div>
          <div>
            <h3>Channel History</h3>
            <History messages={this.state.history} />
            <form onSubmit={e => this.sendMessage(e)}>
              <input
                type={"text"}
                placeholder={"Send a message"}
                value={this.state.message}
                onChange={msg => this.setState({ message: msg.target.value })}
              />
              <button type={`submit`}>Send</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
