export const authIsValid = (password: string, res: any) => {
  if (password !== process.env.POST_PASSWORD) {
    res.status(401).json("Ugyldig passord :'(");
    return false;
  }
  return true;
};
