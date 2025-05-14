export const forgotPasswordTamplate = ({name, otp}) => {
  return `
    <div>
    <p>Dear, ${name} </p>
    <p>You're requested to a password reset,Please use following code to  reset  your password </p>
    <div style="background:yellow;font-size= 20px">${otp}</div>
    <p>This otp is valid for 1hour only,Enter this otp in the thegrocery website to proceed with resetting your password
    </P>
    <br/>
    <br/>
    <p>Thanks</p>
    <p>thegrocery</p>


    </div>
    
    `;
};
