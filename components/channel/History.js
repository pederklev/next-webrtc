import { format } from "date-fns";

export default class extends React.Component {
  componentDidUpdate() {
    // get the messagelist container and set the scrollTop to the height of the container
    const objDiv = document.getElementById("messageList");
    objDiv.scrollTop = objDiv.scrollHeight;
  }
  render() {
    return (
      <div id="messageList">
        {this.props.messages.map((item, i) => Sorter(item))}
      </div>
    );
  }
}

const Sorter = item => {
  switch (item.type) {
    case "system":
      return (
        <p key={item.time}>
          <span>{format(item.time, "HH:mm")}</span>
          {item.msg}
          {item.sender && ` (${item.sender})`}
        </p>
      );
    case "me":
      return <p key={item.time}>{item.msg}</p>;
    case "partner":
      return (
        <p key={item.time}>
          <span>{item.sender}</span>
          {item.msg}
        </p>
      );

    default:
      break;
  }
};
