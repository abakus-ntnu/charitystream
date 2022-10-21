export const fetcher = (url) => fetch(url).then((res) => res.json());

export const fetchRequest = async (
  url: string,
  method: string,
  body: any,
  handleRes: (res: any) => any,
  addAlert: (s1, s2) => void,
  password: string
) => {
  const actualBody = method === "GET" ? null : JSON.stringify({ ...body });
  const res = await fetch(url, {
    method: method,
    headers: {
      password,
      "Content-Type": "application/json",
    },
    body: actualBody,
  });
  await handleRes(res);
  if (res.status !== 200) {
    const json = await res.json();
    addAlert(
      `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
      "red"
    );
  }
};
