import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const fileSize = parseInt(req?.query?.size as any) || 1048576; // default to 1MB
  console.log(fileSize);
  const buffer = Buffer.alloc(fileSize);

  if (req.method === "GET") {
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(buffer);
  } else if (req.method === "POST") {
    req.on("data", () => {});
    req.on("end", () => {
      res.send("ok");
    });
  } else {
    res.status(405).end();
  }
}
