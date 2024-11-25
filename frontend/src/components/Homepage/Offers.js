function Offers() {
    const offers = ["Buy 1 Get 1 Free", "20% off on Orders over £100"];
    return (
      <div className="offers">
        <h2>Current Offers</h2>
        <ul>
          {offers.map((offer, index) => (
            <li key={index}>{offer}</li>
          ))}
        </ul>
      </div>
    );
  }
  export default Offers;