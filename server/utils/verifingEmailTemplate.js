export const verifingEmailTemplate = ({name, url}) => {
  return `
    <p>Dear ${name} </p>
    <p> thank you for registering in theGrocery</p>
    <a href=${url} style = "color:white;background:blue; margin-top: 10px "> 
    verify email </a>
    `;
};


