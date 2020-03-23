export default class extends React.Component {
  state = {
    form: 1
  };

  startChannel = (address, transactions, deposit) => {
    this.setState({ form: 0 });
    setTimeout(() => {
      this.props.setChannel();
    }, 500);
  };

  render() {
    var { form } = this.state;
    return (
      <span>
        <h2>Enter a WebRTC Channel</h2>
        <p>{`Lorem ipsum blah blah`}</p>
        <p>{`You can also chat with your partner in the sidebar.`}</p>
        <button onClick={() => this.startChannel()}>
          {`Enter the Channel`}
        </button>
      </span>
    );
  }
}
