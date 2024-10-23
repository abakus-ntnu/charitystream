export const fetcher = (url) => fetch(url).then((res) => res.json());

export const fetchRequest = async (
  url: string,
  options?: {
    method?: string;
    password?: string;
    body?: any;
    addAlert?: (text: string, color: string) => void;
  }
) => {
  const { method = "GET", body, password, addAlert } = options;
  const actualBody = method === "GET" ? null : JSON.stringify({ ...body });

  const res = await fetch(url, {
    method,
    headers: {
      password,
      "Content-Type": "application/json",
    },
    body: actualBody,
  });

  if (res.status !== 200) {
    const json = await res.json();
    addAlert &&
      addAlert(
        `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
        "red"
      );
  }

  return res;
};
