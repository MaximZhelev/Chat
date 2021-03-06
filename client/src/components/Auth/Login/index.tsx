import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  CircularProgress,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";

// Local Imports
import logo from "../../../assets/gc-logo-symbol-nobg.png";
import CustomButton from "../../Shared/CustomButton/index";
import styles from "./styles.module.scss";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));
type Props = {};

type SnackData = {
  open: boolean;
  message: string | null;
};

const Login: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [snack, setSnack] = useState<SnackData>({ open: false, message: null });

  // Async Requests
  const loginSubmit = async (
    checked: boolean,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    let response;
    try {
      response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/users/login`,
        {
          checked,
          email: email.toLowerCase(),
          password: password.toLowerCase(),
        }
      );
    } catch (error) {
      console.log("[ERROR][AUTH][LOGIN]: ", error);
      setIsLoading(false);
      return;
    }
    if (!response.data.access) {
      setSnack({ open: true, message: response.data.message });
      setIsLoading(false);
      return;
    }
    if (checked) {
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: response.data.user.id,
          token: response.data.user.token,
        })
      );
    }
    dispatch({ type: "LOGIN", payload: { ...response.data.user } });
    history.push("");
    setIsLoading(false);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 characters at least")
        .required("Required"),
    }),
    onSubmit: (values) => loginSubmit(checked, values.email, values.password),
  });

  return (
    <div className={styles.container}>
      <Link to="/">
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
      </Link>
      <Typography component="h1" variant="h5">
        Login
      </Typography>
      <form className={styles.form}>
        <TextField
          className={styles.input}
          id="email"
          label="Email"
          variant="outlined"
          type="text"
          helperText={formik.touched.email && formik.errors.email}
          error={formik.touched.email && !!formik.errors.email}
          {...formik.getFieldProps("email")}
        />
        <TextField
          className={styles.input}
          id="password"
          label="Password"
          variant="outlined"
          type="password"
          {...formik.getFieldProps("password")}
          helperText={formik.touched.password && formik.errors.password}
          error={formik.touched.password && !!formik.errors.password}
        />
        <FormControlLabel
          className={styles.check}
          control={
            <Checkbox
              checked={checked}
              onChange={() => setChecked((prev) => !prev)}
              name="checked"
              color="primary"
            />
          }
          label="Remember me"
        />
        <CustomButton
          type="submit"
          onClick={formik.handleSubmit}
          isPurple
          title="Login"
          small={false}
        />
      </form>
      <Link to="/signup">
        <p className={styles.guest}>Don't have an account? Sign Up</p>
      </Link>
      {isLoading && <CircularProgress />}
      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ open: false, message: null })}
        autoHideDuration={5000}
      >
        <MuiAlert
          variant="filled"
          onClose={() => setSnack({ open: false, message: null })}
          severity="error"
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Login;
