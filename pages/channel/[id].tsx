import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { isClient } from "../../libs/utils";

import Header from "../../components/channel/Header";
import History from "../../components/channel/History";

import RTC from "../../libs/rtc";

export const Channel: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [userId, setUserId] = useState<undefined | string>();
  const [alertText, setAlertText] = useState("Test");
  const [peers, setPeers] = useState([]);
  const [roomStatus, setRoomStatus] = useState("share");
  const [title, setTitle] = useState("Loading title");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([
    { msg: "Waiting for a peer...", type: "system", time: Date.now() }
  ]);

  useEffect(() => {
    if (id === undefined) {
      console.error("Found no channel id");
      return;
    }
    initChannel();
  }, [id]);

  const initChannel = async () => {
    var peer = await RTC.initChannel(id);
    setUserId(peer.id);
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
        setAlertText(message.data.error);
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
      setTitle("Channel established");
      setRoomStatus("connected");
      setPeers(Array.from(new Set([...peers, message.connection.peer])));
    });
    Events.on("peerLeft", message => {
      console.log("Peer Left:", message.connection.peer);
      updateHistory({
        msg: "Peer Disconnected",
        type: "system",
        sender: message.connection.peer,
        time: Date.now()
      });
      setTitle("Waiting for peers to connect...");
      setRoomStatus("share");
      setPeers(peers.filter(item => item != message.connection.peer));
      RTC.connectToPeers(id);
    });
  };

  if (!id) return <>blabla</>;

  const updateHistory = data => {
    setHistory([...history, data]);
  };

  const sendMessage = e => {
    e.preventDefault();
    if (!message) return;
    updateHistory({
      msg: message,
      type: "me",
      sender: "me",
      time: Date.now()
    });
    RTC.broadcastMessage({ cmd: "message", msg: message });
    console.log("Sending message", message);
    setMessage("");
  };

  return (
    <div>
      <div>
        <div>
          <h2 style={{ zIndex: 300 }}>{alertText}</h2>
          <button
            onClick={() => setAlertText("")}
          >{`   Clear Notification  `}</button>
        </div>
      </div>
      <div>
        <div>
          <div>
            <Header title={title} connected={peers.length > 0} />
            <p>Status: {roomStatus}</p>
            <p>Your ID: {userId}</p>
            <p>Connected peers: {peers.length}</p>
            <br />
            <p>Share this room link with your partner:</p>
            <p>{isClient ? window.location.href : null}</p>
          </div>
          {/* )} */}
        </div>
        <div>
          <h3>Channel History</h3>
          <History messages={history} />
          <form onSubmit={e => sendMessage(e)}>
            <input
              type={"text"}
              placeholder={"Send a message"}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button type={`submit`}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Channel;
