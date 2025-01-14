import { Navigate, Route } from "react-router-dom";

import { PrivateRoute } from "../Core";

import { PoolPage, AddLiquidity, RemoveLiquidityPage, Pools } from "./pages";

import { Pages } from "~/types";

export const poolRoutes = (
  <Route
    path={`${Pages.pool}/*`}
    element={
      <PrivateRoute>
        <PoolPage />
      </PrivateRoute>
    }
  >
    <Route index element={<Navigate to={Pages["pool.list"]} />} />
    <Route path={Pages["pool.list"]} element={<Pools />} />
    <Route path={Pages["pool.addLiquidity"]} element={<AddLiquidity />} />
    <Route
      path={Pages["pool.removeLiquidity"]}
      element={<RemoveLiquidityPage />}
    />
  </Route>
);
