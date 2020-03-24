import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { isClient } from "../../libs/utils";

import Header from "../../components/channel/Header";
import History from "../../components/channel/History";

import RTC from "../../libs/rtc";

export const Channel: React.FC = props => {
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useState({
    visible: 0,
    alert: false,
    alertText: "Test",
    connected: false,
    channel: "share",
    userID: undefined,
    peers: [],
    title: "Initial title. Loading..?",
    history: [
      { msg: "Waiting for a peer...", type: "system", time: Date.now() }
    ],
    message: ""
  });

  useEffect(() => {
    // if (id === undefined) {
    //   Router.push(`/`);
    // }
    if (id === undefined) {
      console.log("found no id");
      return;
    }
    console.log("Channel ID: " + id);
    setTimeout(() => {
      setState({ ...state, visible: 1 });
    }, 300);
    initChannel();
  }, [id]);

  const initChannel = async () => {
    console.log("Init channel ID", id);
    var started = false;
    console.log("Peer?");
    var peer = await RTC.initChannel(id);
    console.log("peer: ", peer);
    setState({
      ...state,
      userID: peer.id
    });
    var Events = RTC.getEvents();

    RTC.connectToPeers(id);

    Events.on("message", async message => {
      console.log(`Message: ${message.connection.peer}:`, message.data);

      if (message.data.cmd === "message") {
        updateHistory({
          msg: message.data.msg,
          type: "partner",
          sender: message.connection.peer,
          time: Date.now()
        });
      } else if (message.data.cmd === "error") {
        updateHistory({
          msg: `${message.data.error}`,
          type: "system",
          sender: message.connection.peer,
          time: Date.now()
        });
        setState({
          ...state,
          alert: true,
          alertText: message.data.error
        });
      }
    });
    Events.on("peerJoined", async message => {
      console.log(`Peer Joined:`, message.connection.peer);
      updateHistory({
        msg: "Peer Connected",
        type: "system",
        sender: message.connection.peer,
        time: Date.now()
      });
      setState({
        ...state,
        channel: "connected",
        peers: Array.from(new Set([...state.peers, message.connection.peer])),
        title: "Channel established"
      });
    });
    Events.on("peerLeft", message => {
      console.log("Peer Left:", message.connection.peer);
      updateHistory({
        msg: "Peer Disconnected",
        type: "system",
        sender: message.connection.peer,
        time: Date.now()
      });
      setState({
        ...state,
        channel: "share",
        peers: state.peers.filter(item => item != message.connection.peer),
        title: "Waiting for peers to connect..."
      });
      RTC.connectToPeers(id);
    });
  };

  if (!id) return <>blabla</>;

  const updateHistory = data => {
    var history = state.history;
    history.push(data);
    setState({ ...state, history });
  };

  const sendMessage = e => {
    e.preventDefault();
    if (!state.message) return;
    updateHistory({
      msg: state.message,
      type: "me",
      sender: "me",
      time: Date.now()
    });
    RTC.broadcastMessage({ cmd: "message", msg: state.message });
    console.log("Sending message", state.message);
    setState({ ...state, message: "" });
  };

  return (
    <div>
      <div>
        <div>
          <h2 style={{ zIndex: 300 }}>{state.alertText && state.alertText}</h2>
          <button
            onClick={() => setState({ ...state, alert: false })}
          >{`   Clear Notification  `}</button>
        </div>
      </div>
      <div>
        <div>
          <div>
            <Header title={state.title} connected={state.peers.length > 0} />
            <p>Your ID: {state.userID}</p>
            <p>Connected peers: {state.peers.length}</p>
            <br />
            <p>Share this room link with your partner:</p>
            <p>{isClient ? window.location.href : null}</p>
          </div>
          {/* )} */}
        </div>
        <div>
          <h3>Channel History</h3>
          <History messages={state.history} />
          <form onSubmit={e => sendMessage(e)}>
            <input
              type={"text"}
              placeholder={"Send a message"}
              value={state.message}
              onChange={msg =>
                setState({ ...state, message: msg.target.value })
              }
            />
            <button type={`submit`}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Channel;
