import * as yup from "yup";

export const loginSchema = yup.object({
  username: yup.string().trim().required("وارد کردن نام کاربری الزامی است"),
  password: yup.string().required("وارد کردن رمز عبور الزامی است"),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد")
    .required("وارد کردن نام و نام خانوادگی الزامی است"),
  username: yup
    .string()
    .trim()
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
    .matches(/^[a-zA-Z0-9_]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و _ باشد")
    .required("وارد کردن نام کاربری الزامی است"),
  email: yup
    .string()
    .trim()
    .email("ایمیل وارد شده معتبر نیست")
    .required("وارد کردن ایمیل الزامی است"),
  password: yup
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .required("وارد کردن رمز عبور الزامی است"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "تکرار رمز عبور مطابقت ندارد")
    .required("تکرار رمز عبور الزامی است"),
});

export const authSchema = loginSchema;
