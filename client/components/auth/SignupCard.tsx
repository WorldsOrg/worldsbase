import { useState } from "react";
import { FormControl, Input, Stack, Text } from "@chakra-ui/react";

type SignupCredentials = {
  email: string;
  password: string;
};

interface SignupCardProps {
  handleSignup: (credentials: SignupCredentials) => void;
  changeSignupCard: () => void;
  loading: boolean;
}

export default function SignupCard({ handleSignup, changeSignupCard, loading }: SignupCardProps) {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof SignupCredentials) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <div className="mx-auto my-auto">
      <div className="p-4 border rounded-lg border-secondary">
        <Stack spacing="8">
          <Stack spacing="6" align="center">
            <h1 className="text-primary">Signup</h1>
          </Stack>
          <Stack spacing="6">
            <FormControl isRequired>
              <Input className="rounded-md" placeholder="Email" id="email" type="email" value={credentials.email} onChange={handleInputChange("email")} />
            </FormControl>
            <FormControl isRequired>
              <Input className="rounded-md" placeholder="Password" id="password" type="password" onChange={handleInputChange("password")} />
            </FormControl>
            <button className="p-2 text-white border border-gray-400 rounded-md bg-secondary hover:bg-secondaryHover" onClick={() => handleSignup(credentials)}>
              <span className={loading ? "animate-ping" : ""}>Sign Up</span>
            </button>
          </Stack>
          <Text textStyle="sm" color="fg.muted" textAlign="center" onClick={changeSignupCard} className="cursor-pointer text-primary">
            Already have an account? Log in
          </Text>
        </Stack>
      </div>{" "}
    </div>
  );
}
