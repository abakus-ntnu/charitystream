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
  const { method = "GET", body, password, addAlert } = options ?? {};
  const actualBody = method === "GET" ? null : JSON.stringify({ ...body });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (password) headers["password"] = password;

  const res = await fetch(url, {
    method,
    headers,
    body: actualBody,
  });

  if (res.status !== 200) {
    const json = await res.json();
    if (addAlert) {
      addAlert(
        `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
        "red"
      );
    }
  }

  return res;
};

// New helper utilities
export const formatCurrency = (value: number | undefined | null) => {
  if (value == null || isNaN(value as number)) return "0kr";
  try {
    return `${Number(value).toLocaleString("no-NO")}kr`;
  } catch {
    return `${value}kr`;
  }
};

export const percentage = (value: number, total: number) => {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
};
