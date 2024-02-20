import { FormControl, Input, Stack, Text } from "@chakra-ui/react";
import { Formik, Field } from "formik";

type LoginCredentials = {
  email: string;
  password: string;
};

interface LoginCardProps {
  handleLogin: (credentials: LoginCredentials) => void;
  changeSignupCard: () => void;
  loading: boolean;
}

const emailValidator = (value: string) => {
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return "Must be a valid email";
  }
};

const passwordValidator = (value: string) => {
  if (value.length < 6) {
    return "Password must contain at least 6 characters";
  }
};

export default function LoginCard({ handleLogin, changeSignupCard, loading }: LoginCardProps) {
  return (
    <div className="mx-auto my-auto">
      <div className="p-4 border rounded-lg border-secondary">
        <Formik initialValues={{ email: "", password: "" }} onSubmit={(values) => handleLogin(values)}>
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing="8">
                <Stack spacing="6" align="center">
                  <h1 className="dark:text-slate-300">Login</h1>
                </Stack>
                <Stack spacing="6">
                  <FormControl isInvalid={!!errors.email && touched.email}>
                    <Field as={Input} className="rounded-md" id="email" name="email" type="email" placeholder="example@worlds.org" validate={emailValidator} />
                  </FormControl>
                  <FormControl isInvalid={!!errors.password && touched.password}>
                    <Field className="rounded-md" as={Input} id="password" name="password" type="password" placeholder="Password" validate={passwordValidator} />
                  </FormControl>
                  <button className="p-2 text-white border rounded-md bg-secondary hover:text-black hover:bg-white hover:border-secondary" type="submit">
                    <span className={loading ? "animate-ping" : ""}>Login</span>
                  </button>
                </Stack>
                <Text style={{ cursor: "pointer" }} textStyle="sm" color="fg.muted" textAlign="center" className="dark:text-slate-300" onClick={changeSignupCard}>
                  Need an account? Sign up
                </Text>
              </Stack>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
