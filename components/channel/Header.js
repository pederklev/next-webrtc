export default props => (
  <div>
    <h3>{props.title}</h3>
    <div
      style={{
        backgroundColor: props.connected ? "green" : "orange",
        width: 30,
        height: 30,
        borderRadius: 30
      }}
    />
  </div>
);
