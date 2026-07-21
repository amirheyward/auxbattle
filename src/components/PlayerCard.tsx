import "./PlayerCard.css"
import madi from "../assets/madi.jpeg"
interface PlayerCardProps {
    username?: string
}

function PlayerCard({username = "playername"}: PlayerCardProps) {
  return (
    <div className="cardContainer">
      <img className="profile" src={madi} alt="" />
      <div className="username">{username}</div>
    </div>
  );
}

export default PlayerCard;
