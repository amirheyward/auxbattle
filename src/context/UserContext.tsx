import { createContext } from "react";

// basically typesetting the values for the context
const UserContext = createContext({
    username: "",
    setUsername: (username: string) => {}
})

export default UserContext;