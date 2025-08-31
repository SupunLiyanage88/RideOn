import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "../api/auth";

interface UseCurrentUserResult {
  user: User | undefined;
  status: "idle" | "loading" | "error" | "success" | "pending";
}

function UseCurrentUser(): UseCurrentUserResult {
  const { data, status, error } = useQuery<User, Error>({
    queryKey: ["current-user"],
    queryFn: validateUser,
    retry: false, 
  });

  if (error?.message?.includes("No token, authorization denied")) {
    return { user: undefined, status: "loading" };
  }

  return { user: data, status };
}

export default UseCurrentUser;
