import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    layout("layouts/index.tsx", [
        route("/hotel", "./views/hotel/index.tsx"),
        route("/dashboard", "./views/dashboard/index.tsx"),
    ]),
    layout("layouts2/index.tsx",[
        route("/", "./views/welcome/welcome.tsx"),
        route("/login", "./views/login/index.tsx"),
        route("/register", "./views/register/index.tsx"),
    ]),
    route("*", "./views/NotFound.tsx"),
    
] satisfies RouteConfig;
