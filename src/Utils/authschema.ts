import * as yup from "yup"

export const authSchema = yup.object({
    username: yup
        .string()
        .required("وارد کردن نام کاربری الزامی است")
    ,
    password: yup
        .string()
        .required("وارد کردن رمز عبور الزامی است")

})
