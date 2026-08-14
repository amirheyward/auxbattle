import { useContext, useRef } from "react";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router";

function Login() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { username, setUsername } = useContext(UserContext);
  const naviagte = useNavigate();

  return (
    <div className="mainContainer">
      <div>
        Username:
        <input ref={inputRef} type="text" />
      </div>
      <button
        onClick={() => {
          if (inputRef.current?.value) {
            setUsername(inputRef.current!.value);
            naviagte("/home");
          }
        }}
      >
        Login
      </button>
    </div>
  );
}

export default Login;
