import { App, Request, Response } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import axios from "axios";

const PORT = 5000;

const jokeHandler = async (_req: Request, res: Response) => {
  const BASE_URL = "https://api.icndb.com/jokes/random?escape=javascript";

  type Joke = {
    type: "success" | string;
    value: {
      id: number;
      joke: string;
      categories: string[];
    };
  };

  try {
    const { data: joke } = await axios.get<Joke>(BASE_URL);

    const body =
      joke.type === "success"
        ? { joke: joke.value.joke }
        : { error: "Could not fetch joke" };

    res.json(body);
  } catch (error) {
    console.error(error);
    throw new Error("Something bad happened");
  }
};

type RouteConfig = {
  path: string;
  handler: (req: Request, res: Response) => void;
};

const buildApplication = (routes: RouteConfig[]) => {
  const app = new App({
    onError: (err, _req, res) => {
      console.log(err);
      res.status(500).json({ error: err.message });
    },
  }).use(logger());

  routes.forEach(({ path, handler }) => {
    app.get(path, handler);
  });

  return app;
};

const routes = [{ path: "/", handler: jokeHandler }];

const app = buildApplication(routes);

const startApp = (app: App, port: number) => {
  app.listen(port, () =>
    console.log(`Server started on http://localhost:${port}`)
  );
};

startApp(app, PORT);
