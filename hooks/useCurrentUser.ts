import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "../api/auth";

interface UseCurrentUserResult {
  user: User | undefined;
  status: "idle" | "loading" | "error" | "success" | "pending";
}

function UseCurrentUser(): UseCurrentUserResult {
  const { data, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  console.log("Current user data:", data, "Status:", status);
  return { user: data, status };
}

export default UseCurrentUser;
